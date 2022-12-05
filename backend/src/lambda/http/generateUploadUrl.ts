import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { createAttachmentPresignedUrl } from '../../businessLogic/todos';
import { getUserId } from '../utils';


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('handler: Received request.')
    const todoId = event.pathParameters.todoId;
    const userId: string = getUserId(event);

    if (!todoId || !userId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'No todo id in the request: ' + todoId
        })
      };
    }

    console.log('handler: Received todoId: %s to get signedUrl', todoId);
    const preSignedUrl = await createAttachmentPresignedUrl(todoId, userId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: preSignedUrl
      })
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )