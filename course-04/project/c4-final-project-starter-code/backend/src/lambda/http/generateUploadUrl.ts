import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import * as businessLayer from '../../businessLayer/Todo'

const logger = createLogger('upload');
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  try {
    const uploadUrl : string = await businessLayer.getUploadUrl(userId, todoId);
    return {
      statusCode : 200,
      body: JSON.stringify({
        uploadUrl
      })
    };
  } catch (err) {
    logger.error(JSON.stringify(err));
    return {
      statusCode : 404,
      body: JSON.stringify({
        errorMessage: "Either TODO not found or user is not authorized to upload attachments"
      })
    };
  }
})

handler.use(
  cors({
    credentials: true
  })
)
