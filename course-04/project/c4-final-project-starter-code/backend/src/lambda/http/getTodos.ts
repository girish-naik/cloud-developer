import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { createFileStoreClient, createDocumentClient } from '../../cloud/aws'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const bucketName = process.env.ATTACHMENTS_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const todoTable = process.env.TODO_TABLE
const userIdIndex = process.env.USER_ID_INDEX
const docClient = createDocumentClient();
const s3 = createFileStoreClient();
const logger = createLogger('todo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  try {
    const result = await docClient.query({
      TableName : todoTable,
      IndexName : userIdIndex,
      KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()

    const items = result.Items
    for (var i = 0; i < result.Count; i++) {
      const element = result.Items[i];
      try {
        logger.info("Fetching download URL for - " + element.todoId)
        element.attachmentUrl = await getDownloadUrl(element.todoId);
      } catch (err) {
        logger.warn("Error downloading attachment from s3 - " + JSON.stringify(element) + JSON.stringify(err));
      }
    }
    return {
      statusCode : 200,
      body: JSON.stringify({
        items
      })
    };
  } catch (err) {
    logger.info("Error getting TODO list - " + JSON.stringify(err));
    return {
      statusCode : 400,
      body: JSON.stringify({
        errorMessage: "Error while fetching TODO"
      })
    };
  }
})

handler.use(
  cors({
    credentials: true
  })
)

async function getDownloadUrl(todoId: string) : Promise<string> {
  try {
    await s3.headObject({
      Bucket : bucketName,
      Key: todoId
    }).promise();
    const attachmentUrl = s3.getSignedUrl('getObject',{
      Bucket : bucketName,
      Key: todoId,
      Expires: urlExpiration
    } )
    console.log("Found - ", attachmentUrl);
    return Promise.resolve(attachmentUrl);
  } catch (err) {
    if (err.code !== 'NotFound') {
      logger.error("Error while fetching object.")
    }
  }
  return undefined;
}
