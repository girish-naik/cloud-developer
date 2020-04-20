import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as businessLayer from '../../businessLayer/Todo'
import { TodoItem } from '../../models/TodoItem'

const logger = createLogger('todo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  try {
    const items : TodoItem[] = await businessLayer.getTodos(userId);
    return {
      statusCode : 200,
      body: JSON.stringify({
        items
      })
    };
  } catch (err) {
    logger.error(err);
    return {
      statusCode : 500,
      body: JSON.stringify({
        errorMessage: "Error while fetching TODOs for user."
      })
    };
  }
})

handler.use(
  cors({
    credentials: true
  })
)
