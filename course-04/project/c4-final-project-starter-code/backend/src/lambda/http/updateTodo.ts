import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import * as businessLayer from '../../businessLayer/Todo'
const logger = createLogger('update')
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId: string = getUserId(event);
  const updateTodoRequest: UpdateTodoRequest = JSON.parse(event.body)
  try {
    businessLayer.updateTodo(updateTodoRequest, userId, todoId);
    return {
      statusCode: 201,
      body: ""
    };
  } catch (err) {
    logger.error(JSON.stringify(err));
    return {
      statusCode: 500,
      body: JSON.stringify({
        errorMessage : "TODO item does not exist or user is not authorized to perform update"
      })
    };
  }
})

handler.use(
  cors({
    credentials: true
  })
)