import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { DeleteItemOutput } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../../utils/logger'
import { createDocumentClient, createFileStoreClient } from '../../cloud/aws'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
const todoTable = process.env.TODO_TABLE
const bucketName = process.env.ATTACHMENTS_BUCKET
const docClient = createDocumentClient();
const s3 = createFileStoreClient();
const logger = createLogger("delete");
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId:string = getUserId(event);
  try {
    const deleteItemOutput: DeleteItemOutput = await docClient.delete({
        TableName : todoTable,
        Key : {
          todoId,
          userId
        },
        ReturnValues : "ALL_OLD"
    }).promise()
    const deletedTodo = "" + deleteItemOutput.Attributes.todoId;
    try {
      await s3.deleteObject({
        Bucket: bucketName,
        Key: deletedTodo
      }).promise()
      return {
        statusCode : 200,
        body: ""
      };
    } catch(err) {
      logger.warn("Failed to delete attachment - " + JSON.stringify(err))
    }
  } catch(err) {
    logger.error("Failed to delete todo - " + err);
    return {
      statusCode : 404,
      body: JSON.stringify({
        errorMessage: "Failed to delete todo. Either todo does not exist or user is not authorized to delete the todo."
      })
    };
  }
})

handler.use(
  cors({
    credentials: true
  })
)
