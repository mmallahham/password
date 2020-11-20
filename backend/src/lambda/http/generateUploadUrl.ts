import { generateUploadUrl } from '../../businessLogic/todos'
import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {


  const presignedUrl: any = generateUploadUrl(event);

  if (!presignedUrl) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'error generating presigned URL.'
      })
    };
  }

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': false
    },
    body: JSON.stringify({uploadUrl: presignedUrl})
  };
}
