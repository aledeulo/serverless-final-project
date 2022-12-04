import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos';
import { TodoItem } from '../../models/TodoItem';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body);
    console.log('handler: Received payload: %s', JSON.stringify(newTodo));
    // TODO: Implement creating a new TODO item
    try {
      const userId = getUserId(event);
      console.log('handler: Attempting to create TODO for user: %s', userId);
      const item:TodoItem = await createTodo(userId, newTodo);
      return {
        statusCode: 201,
        body: JSON.stringify({
          newTodo: item
        })
      };   
    } catch (error) {
      console.error('handler: create TODO failed with an error. See response body');
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message,
          request: newTodo
        })
      };
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
