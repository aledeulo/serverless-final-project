import { TodosAccess } from './todosAcess';
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';
import * as uuid from 'uuid';
import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic
const logger = createLogger('TodosService');
const todoAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();
const bucketName = attachmentUtils.getBucketName();

export async function createAttachmentPresignedUrl(todoId:string): Promise<string> {
	logger.info('createAttachmentPresignedUrl: Received command to generate signed url for todo: %s', todoId);
    return await attachmentUtils.getUploadUrl(todoId);
}

export async function getTodosForUser(userId:string):Promise<TodoItem[]> {
	logger.info('getTodosForUser: Received command to fetch all TODOs for user: %s', userId);
	return await todoAccess.getTodosForUser(userId);
}

export async function createTodo(userId:string, request:CreateTodoRequest): Promise<TodoItem> {
	const todoId = uuid.v4();
	const item: TodoItem = {
		userId,
		todoId,
		createdAt: new Date().toISOString(),
		name: request.name,
		dueDate: request.dueDate,
		done: false,
		attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
	}
	return await todoAccess.createTodo(item);
}

export async function updateTodo(item:UpdateTodoRequest, todoId:string, userId:string): Promise<void>{
	logger.info('updateTodo: Received command to update TODO: %s', todoId);
	const exist:boolean = await validateTodoExist(todoId);
	if (!exist) {
		throw new Error("updateTodo: No items in dynamodb with todoId: " + todoId);		
	}

	const todoUpdate:TodoUpdate = {
		name: item.name,
		done: item.done,
		dueDate: item.dueDate
	}
	logger.info('updateTodo: TODO validated for id: %s. Sending request to update.', todoId);
	await todoAccess.updateTodo(todoUpdate, todoId, userId);
} 

function validateTodoExist(todoId:string):Promise<boolean> {
	return todoAccess.verifyTodoItem(todoId);
}
