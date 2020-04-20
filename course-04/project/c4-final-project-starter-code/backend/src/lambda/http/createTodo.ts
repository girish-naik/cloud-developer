import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { TodoItem } from '../../models/TodoItem'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import * as businessLayer from '../../businessLayer/Todo'
import { createLogger } from '../../utils/logger'

const logger = createLogger("createTodoHandler");

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId: string = getUserId(event);
  try {
    const newTodoItem : TodoItem = await businessLayer.createTodo(newTodo, userId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        item : newTodoItem
      })
    };
  } catch (err) {
    logger.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        errorMessage : "Failed creating TODO item."
      })
    };
  }
})

handler.use(
  cors({
    credentials: true
  })
)