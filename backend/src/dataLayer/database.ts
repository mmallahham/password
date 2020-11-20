import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { TodoItem } from '../models/TodoItem';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../utils/logger';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const logger = createLogger("debug");
const XAWS = AWSXRay.captureAWS(AWS);

export default class TodosDB {
    constructor(
        private readonly dynamoClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly tableName = process.env.TODOS_TABLE,
        private readonly indexName = process.env.INDEX_NAME) {
    }
    
    async addTodo(todoItem: TodoItem) {
        await this.dynamoClient.put({
            TableName: this.tableName,
            Item: todoItem
        }).promise();
    }
  
    async getTodo(todoId: string, userId: string) {
        const result = await this.dynamoClient.get({
            TableName: this.tableName,
            Key: {
                todoId,
                userId
            }
        }).promise();
  
        return result.Item;
    }
  
    async getAllTodos(userId: string) {
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
  
    async updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest) {
        logger.info('updateTodo');
        await this.dynamoClient.update({
            TableName: this.tableName,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
            ExpressionAttributeValues: {
                ':n': updatedTodo.name,
                ':due': updatedTodo.dueDate,
                ':d': updatedTodo.done
            },
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            }
        }).promise();
    }

    async deleteTodo(todoId: string, userId: string) {
        const res = await this.dynamoClient.delete({
            TableName: this.tableName,
            Key: {
                todoId,
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
  