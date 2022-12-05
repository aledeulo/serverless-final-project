import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as AWSXRay from 'aws-xray-sdk';
const XAWS = AWSXRay.captureAWS(AWS);
import { createLogger } from '../utils/logger';
const logger = createLogger('AttachmentUtils');

// TODO: Implement the fileStorage logic
export class AttachmentUtils {
	constructor(
		private readonly todosTable = process.env.TODOS_TABLE,
		private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
		private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
		private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),
		private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient()
	){}

	// Access to S3 to generates pre-signed URLs
	async getUploadUrl(todoId: string): Promise<string> {
		logger.info('getUploadUrl: Received todoId: %s', todoId);
		return this.s3.getSignedUrl('putObject', {
			Bucket: this.bucketName,
			Key: todoId,
			Expires: parseInt(this.urlExpiration)
			});
		}

	

	async updateAttachment(todoId: string, userId: string): Promise<void> {
		logger.info('updateAttachment: Attempting to upload attachment for todo: %s', todoId);
		await this.docClient.update({
			TableName: this.todosTable,
			Key: {
				todoId: todoId,
				userId: userId
			},
			UpdateExpression: "set attachmentUrl = :attachmentUrl",
			ExpressionAttributeValues: {
				":attachmentUrl": `https://${this.getBucketName()}.s3.amazonaws.com/${todoId}`
			}
		}).promise();
	}

	getBucketName(){
		return this.bucketName;
	}
}