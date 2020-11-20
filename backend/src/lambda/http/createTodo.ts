import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createTodo } from '../../businessLogic/todos';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';


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
  const todo = await createTodo(event, newTodo);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },

    body: JSON.stringify({
      item: todo
    })
  };
}
