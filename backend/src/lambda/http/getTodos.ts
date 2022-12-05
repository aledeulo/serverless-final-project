import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { TodoItem } from '../../models/TodoItem';
import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos';
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy (
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here    
    const userId:string = getUserId(event);
    console.log('handler: Attempting to fetch TODOs for user: %s', userId);
    const todos:TodoItem[] = await getTodosForUser(userId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        todos
      })
    };
})

handler
.use(httpErrorHandler())
.use(
  cors({
    credentials: true
  })
)
