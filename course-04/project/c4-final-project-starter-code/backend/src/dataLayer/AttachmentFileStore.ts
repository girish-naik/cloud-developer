import { createFileStoreClient } from "../cloud/aws";
import { createLogger } from "../utils/logger";
const s3 = createFileStoreClient();
const bucketName = process.env.ATTACHMENTS_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const logger = createLogger('AttachmentFileStore')

export async function getDownloadUrl(todoId: string) : Promise<string> {
    try {
        await s3.headObject({
            Bucket : bucketName,
            Key: todoId
        }).promise();
        const attachmentUrl = s3.getSignedUrl('getObject',{
            Bucket : bucketName,
            Key: todoId,
            Expires: urlExpiration
        });
        logger.info("Fetched Url - " + attachmentUrl)
        return Promise.resolve(attachmentUrl);
    } catch (err) {
        logger.error(err)
        if (!err.code || err.code !== 'NotFound') {
        logger.error("Error creating signed URL for todo. " + JSON.stringify(err))
        }
    }
    return undefined;
}

export async function deleteAttachment(todoId: string) {
    try {
        await s3.headObject({
            Bucket : bucketName,
            Key: todoId
        }).promise();
        await s3.deleteObject({
            Bucket: bucketName,
            Key: todoId
        }).promise()
    } catch (err) {
        if (!err.code || err.code !== 'NotFound') {
            logger.error("Error deleting attachment for todo. " + JSON.stringify(err))
        }
    }
}

export function getUploadUrl(attachementId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: attachementId,
        Expires: urlExpiration
    });
}