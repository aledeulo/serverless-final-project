import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { deleteTodo } from '../../helpers/todos';
import { getUserId } from '../utils';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('handler: Received request with event: %s', event);
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    await deleteTodo(todoId, userId);
      return {
        statusCode: 200,
        body: "{}"
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
