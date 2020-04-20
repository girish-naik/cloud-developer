import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createDocumentClient } from '../../cloud/aws'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
const todoTable = process.env.TODO_TABLE
const docClient = createDocumentClient();
const logger = createLogger('update')
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId: string = getUserId(event);
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  try {
    await docClient.update({
      TableName: todoTable,
      Key : {
        todoId,
        userId
      },
      UpdateExpression : "SET #nm = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeValues : {
        ':name' : updatedTodo.name,
        ':dueDate' : updatedTodo.dueDate,
        ':done' : updatedTodo.done
      },
      ExpressionAttributeNames : {
        "#nm": "name"
      }
    }).promise()
    return {
      statusCode: 201,
      body: ""
    };
  } catch (err) {
    logger.error("Failed to update TODO " + JSON.stringify(err));
    return {
      statusCode: 404,
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