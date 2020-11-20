import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { CreateSignedURLRequest } from '../requests/CreateSignedURLRequest';

const XAWS = AWSXRay.captureAWS(AWS);
const S3 = new XAWS.S3({ signatureVersion: 'v4'});

export function getPresignedUploadURL(createSignedURLRequest: CreateSignedURLRequest) {
  return S3.getSignedUrl('putObject',createSignedURLRequest);
}

export function getBucketName() {
    return process.env.S3_BUCKET;
}