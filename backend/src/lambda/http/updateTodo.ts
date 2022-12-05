import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { updateTodo } from '../../businessLogic/todos';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { getUserId } from '../utils';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const userId:string = getUserId(event);
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    console.log('handler: Received request to update TODO: %s with payload: %s', todoId, event.body);
    await updateTodo(updatedTodo, todoId, userId);
    console.log('handler: Updated TODO: %s with payload: %s', todoId, event.body);
    return {
      statusCode: 200,
      body: "{}"
    };
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
