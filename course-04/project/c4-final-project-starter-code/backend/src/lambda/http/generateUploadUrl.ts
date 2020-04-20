import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { createFileStoreClient, createDocumentClient } from '../../cloud/aws'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
const bucketName = process.env.ATTACHMENTS_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const todoTable = process.env.TODO_TABLE
const userIdIndex = process.env.USER_ID_INDEX
const docClient = createDocumentClient();
const s3 = createFileStoreClient();
const logger = createLogger('upload');
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  try {
    const results = await docClient.query({
      TableName : todoTable,
      IndexName : userIdIndex,
      KeyConditionExpression: 'todoId = :todoId and userId = :userId',
      ExpressionAttributeValues: {
          ':todoId': todoId,
          ':userId': userId
      }
    }).promise()
    if (results.Count != 0) {
      const attachementId = results.Items[0].todoId;
      console.log(results.Items[0].todoId);
      const uploadUrl = getUploadUrl(attachementId);
      return {
        statusCode : 200,
        body: JSON.stringify({
          uploadUrl
        })
      };
    }
  } catch (err) {
    logger.error("Failed to generate signed URL - " + JSON.stringify(err));
    return {
      statusCode : 404,
      body: JSON.stringify({
        errorMessage: "Either TODO not found or user is not authorized to upload attachments"
      })
    };
  }
})

function getUploadUrl(attachementId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: attachementId,
    Expires: urlExpiration
  });
}

handler.use(
  cors({
    credentials: true
  })
)
