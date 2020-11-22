import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogin } from '../../businessLogic/logins';
import { CreateLoginRequest } from '../../requests/CreateLoginRequest';


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newLogin: CreateLoginRequest = JSON.parse(event.body)
  
  // check if we have the name in the request or return error
  if (!newLogin.domainName) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Name is rquired.'
      })
    };
  }
  const login = await createLogin(event, newLogin);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },

    body: JSON.stringify({
      item: login
    })
  };
}
