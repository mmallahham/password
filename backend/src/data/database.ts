import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { TodoItem } from './../models/TodoItem';
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../utils/logger';

const logger = createLogger("debug");
const XAWS = AWSXRay.captureAWS(AWS);
const dynamoClient = new XAWS.DynamoDB.DocumentClient();

const tableName = process.env.TODOS_TABLE;
const indexName = process.env.INDEX_NAME

export default class TodosDB {
    async addTodo(todoItem: TodoItem) {
        await dynamoClient.put({
            TableName: tableName,
            Item: todoItem
        }).promise();
    }
  
    async getTodo(todoId: string, userId: string) {
        const result = await dynamoClient.get({
            TableName: tableName,
            Key: {
                todoId,
                userId
            }
        }).promise();
  
        return result.Item;
    }
  
    async getAllTodos(userId: string) {
        const result = await dynamoClient.query({
            TableName: tableName,
            IndexName: indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId 
            }
        }).promise();
  
        return result.Items;
    }
  
    async updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest) {
        logger.info('updateTodo');
        await dynamoClient.update({
            TableName: tableName,
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
        const res = await dynamoClient.delete({
            TableName: tableName,
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
  