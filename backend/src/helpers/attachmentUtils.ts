import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
const XAWS = AWSXRay.captureAWS(AWS);
import { createLogger } from '../utils/logger';
const logger = createLogger('AttachmentUtils');

// TODO: Implement the fileStorage logic
export class AttachmentUtils {
	constructor(
		private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
		private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
		private readonly s3 = new XAWS.S3({signatureVersion: 'v4'})
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


	async getBucketName(){
		return this.bucketName;
	}
}