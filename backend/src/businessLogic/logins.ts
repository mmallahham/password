import 'source-map-support/register';
import * as uuid from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';

import LoginDB from '../dataLayer/database';
import { getPresignedUploadURL } from '../dataLayer/loginStorage';
import { getBucketName } from '../dataLayer/loginStorage';
import { getUserId } from '../lambda/utils';
import { CreateLoginRequest } from '../requests/CreateLoginRequest';
import { UpdateLoginRequest } from '../requests/UpdateLoginRequest';
import { CreateSignedURLRequest } from '../requests/CreateSignedURLRequest';
import { LoginItem } from '../models/LoginItem';

const loginsAccess = new LoginDB();

export async function createLogin(event: APIGatewayProxyEvent,
                                 createLoginRequest: CreateLoginRequest): Promise<LoginItem> {
    const loginId = uuid.v4();
    const userId = getUserId(event);
    const createdAt = new Date(Date.now()).toISOString();

    const loginItem = {
        userId,
        loginId,
        createdAt,
        done: false,
        attachmentUrl: `https://${getBucketName()}.s3.amazonaws.com/${loginId}`,
        ...createLoginRequest
    };

    await loginsAccess.addLogin(loginItem);

    return loginItem;
}

export async function deleteLogin(event: APIGatewayProxyEvent) {
    const loginId = event.pathParameters.loginId;
    const userId = getUserId(event);

    if (!(await loginsAccess.getLogin(loginId, userId))) {
        return false;
    }

    await loginsAccess.deleteLogin(loginId, userId);

    return true;
}

export async function getLogin(event: APIGatewayProxyEvent) {
    const loginId = event.pathParameters.loginId;
    const userId = getUserId(event);

    return await loginsAccess.getLogin(loginId, userId);
}

export async function getAllLogins(event: APIGatewayProxyEvent) {
    const userId = getUserId(event);

    return await loginsAccess.getAllLogins(userId);
}

export async function updateLogin(event: APIGatewayProxyEvent) {

    const updateLoginRequest: UpdateLoginRequest = JSON.parse(event.body);
    const loginId = event.pathParameters.loginId;
    const userId = getUserId(event);

    if (!(await loginsAccess.getLogin(loginId, userId))) {
        return false;
    }

    await loginsAccess.updateLogin(loginId, userId, updateLoginRequest);

    return true;
}

export async function generateUploadUrl(event: APIGatewayProxyEvent) {
    const bucket = getBucketName();
    const urlExpiration = 300;
    const loginId = event.pathParameters.loginId;

    const createSignedUrlRequest: CreateSignedURLRequest = {
        Bucket: bucket,
        Key: loginId,
        Expires: urlExpiration
    }
    
    return getPresignedUploadURL(createSignedUrlRequest);
}