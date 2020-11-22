import { UpdateLoginRequest } from '../requests/UpdateLoginRequest';
import { LoginItem } from '../models/LoginItem';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../utils/logger';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const logger = createLogger("debug");
const XAWS = AWSXRay.captureAWS(AWS);

export default class LoginDB {
    constructor(
        private readonly dynamoClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly tableName = process.env.LOGINS_TABLE,
        private readonly indexName = process.env.INDEX_NAME) {
    }
    
    async addLogin(loginItem: LoginItem) {
        await this.dynamoClient.put({
            TableName: this.tableName,
            Item: loginItem
        }).promise();
    }
  
    async getLogin(loginId: string, userId: string) {
        const result = await this.dynamoClient.get({
            TableName: this.tableName,
            Key: {
                loginId,
                userId
            }
        }).promise();
  
        return result.Item;
    }
  
    async getAllLogins(userId: string) {
        const result = await this.dynamoClient.query({
            TableName: this.tableName,
            IndexName: this.indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId 
            }
        }).promise();
  
        return result.Items;
    }
  
    async updateLogin(loginId: string, userId: string, updatedLogin: UpdateLoginRequest) {
        logger.info('updateLogin');
        await this.dynamoClient.update({
            TableName: this.tableName,
            Key: {
                loginId,
                userId
            },
            UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
            ExpressionAttributeValues: {
                ':n': updatedLogin.domainName,
                ':due': updatedLogin.userName,
                ':d': updatedLogin.password
            },
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            }
        }).promise();
    }

    async deleteLogin(loginId: string, userId: string) {
        const res = await this.dynamoClient.delete({
            TableName: this.tableName,
            Key: {
                loginId,
                userId
            }
        }, function(err, _) {
            if (err) {
                return false
            } else {
                return true
            }
        }).promise();
        return res;
    }
  }
  