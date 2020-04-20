import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import * as businessLayer from '../../businessLayer/Todo'

const logger = createLogger("delete");
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId:string = getUserId(event);
  try {
    await businessLayer.deleteTodo(userId, todoId);
  } catch(err) {
    logger.error(err);
    return {
      statusCode : 404,
      body: JSON.stringify({
        errorMessage: "Failed to delete todo. Either todo does not exist " 
        + "or user is not authorized to delete the todo."
      })
    };
  }
})

handler.use(
  cors({
    credentials: true
  })
)
