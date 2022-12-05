import { TodosAccess } from '../dataAccess/todosAcess';
import { AttachmentUtils } from '../helpers/attachmentUtils';
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

export async function createAttachmentPresignedUrl(todoId:string, userId:string): Promise<string> {
	logger.info('createAttachmentPresignedUrl: Received command to generate signed url for todo: %s', todoId);
	const url = await attachmentUtils.getUploadUrl(todoId);
	await attachmentUtils.updateAttachment(todoId, userId);
    return url;
}

export async function getTodosForUser(userId:string):Promise<TodoItem[]> {
	logger.info('getTodosForUser: Received command to fetch all TODOs for user: %s', userId);
	return await todoAccess.getTodosForUser(userId);
}

export async function createTodo(userId:string, request:CreateTodoRequest): Promise<TodoItem> {
	logger.info('createTodo: Received command to create a TODO for user: %s', userId);
	const todoId = uuid.v4();
	const item: TodoItem = {
		userId,
		todoId,
		createdAt: new Date().toISOString(),
		name: request.name,
		dueDate: request.dueDate,
		done: false
	};
	return await todoAccess.createTodo(item);
}

export async function updateTodo(item:UpdateTodoRequest, todoId:string, userId:string): Promise<void>{
	logger.info('updateTodo: Received command to update TODO: %s', todoId);
	const todoUpdate:TodoUpdate = {
		name: item.name,
		done: item.done,
		dueDate: item.dueDate
	};
	logger.info('updateTodo: TODO validated for id: %s. Sending request to update.', todoId);
	await todoAccess.updateTodo(todoUpdate, todoId, userId);
}

export async function deleteTodo(todoId: string, userId: string): Promise<any> {
	await todoAccess.delete(todoId, userId);
}
