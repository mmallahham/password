import 'source-map-support/register'
import TodosDB from '../../data/database'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);

  const todoDb = new TodosDB();

  if (!(await todoDb.deleteTodo(todoId, userId))) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'an error while deleting Todo'
      })
    };
  }

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  };
}
