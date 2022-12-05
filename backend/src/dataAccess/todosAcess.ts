import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('TodosAccess');

export class TodosAccess {
	constructor(		
		private readonly todosTable = process.env.TODOS_TABLE,
		private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
	){}

	async getTodosForUser(userId:string):Promise<TodoItem[]> {
		logger.info('getTodosForUser: Attempting to fetch all TODOs for user: %s', userId);
		const result = await this.docClient.query({
			TableName : this.todosTable,
			KeyConditionExpression: 'userId = :userId',
			ExpressionAttributeValues: {
				':userId': userId
			},
			ScanIndexForward: false
		}).promise();
		return result.Items as TodoItem[];
	}

	async createTodo(item:TodoItem): Promise<TodoItem> {
		logger.info('createTodo: Attempting to create TODO in dynamodb with details: %s', JSON.stringify(item));
		await this.docClient.put({
			TableName: this.todosTable,
			Item: item
		  }).promise();
		  return item;
	}


	async updateTodo(item:TodoUpdate, todoId:string, userId:string):Promise<void>{
		logger.info('updateTodo: Attempting to update item: %s for id: %s', JSON.stringify(item), todoId);
		const params = {
			TableName: this.todosTable,
			Key: {
				"todoId": todoId,
                "userId": userId
			},
			UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
			ExpressionAttributeNames: {
				'#name': 'name'
			  },
			ExpressionAttributeValues: {
				":name": item.name,
				":dueDate": item.dueDate,
				":done": item.done
			}
		};
		this.docClient.update(params).promise();
	}

	async delete(todoId: string, userId: string): Promise<any> {
        logger.info('delete: Attempting to delete id: %s of user: %s', todoId, userId);
        return this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise();
    }
}