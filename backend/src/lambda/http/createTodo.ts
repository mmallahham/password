import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import 'source-map-support/register'
import * as uuid from 'uuid';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId, getBucketName } from '../utils';
import TodosDB from '../../data/database'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  
  // check if we have the name in the request or return error
  if (!newTodo.name) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Name is rquired.'
      })
    };
  }
  const userId = getUserId(event);
  const todoId = uuid.v4();
  const createdAt = new Date(Date.now()).toISOString();

  const todoItem = {
      userId,
      todoId,
      createdAt,
      done: false,
      attachmentUrl: `https://${getBucketName()}.s3.amazonaws.com/${todoId}`,
      ...newTodo
  };

  const todoDb = new TodosDB();

  await todoDb.addTodo(todoItem);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },

    body: JSON.stringify({
      item: todoItem
    })
  };
}
