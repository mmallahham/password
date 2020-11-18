import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

const XAWS = AWSXRay.captureAWS(AWS);
const S3 = new XAWS.S3({ signatureVersion: 'v4'});

export function getBucketName() {
  return process.env.S3_BUCKET;
} 

export function getPresignedUploadURL(todoId: string) {

  const bucket = process.env.S3_BUCKET;
  const key = todoId;
  const urlExpiration = 2000;

  const getSignedUrlRequest = {
    Bucket: bucket,
    Key: key,
    Expires: urlExpiration
  }

  return S3.getSignedUrl('putObject',getSignedUrlRequest);
}