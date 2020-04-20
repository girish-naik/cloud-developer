import * as AWSXray from 'aws-xray-sdk'
import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { S3 } from 'aws-sdk';

function isXRAYEnabled() : AWSXray {
    if (!process.env.IS_OFFLINE && process.env.IS_XRAY_ENABLED) {
        return true;
    } else {
        return false;
    }
}

export function createDocumentClient(): DocumentClient {
    const xRayEnabled:boolean = isXRAYEnabled();
    if (process.env.IS_OFFLINE) {
        return new AWS.DynamoDB.DocumentClient({
            region : "localhost",
            endpoint: "http://localhost:8000"
        });
    } else {
        if (!xRayEnabled) {
            return new AWS.DynamoDB.DocumentClient();
        } else {
            return new AWSXray.DynamoDB.DocumentClient();
        }
    }
}

export function createFileStoreClient(): S3 {
    const xRayEnabled:boolean = isXRAYEnabled();
    const options = {
        signatureVersion: 'v4'
      };
    if (!xRayEnabled) {
        return new AWS.S3(options);
    } else {
        return new AWSXray.S3(options);
    }
}