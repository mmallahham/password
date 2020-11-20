import 'source-map-support/register';
import * as uuid from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';

import TodosDB from '../dataLayer/database';
import { getPresignedUploadURL } from '../dataLayer/todoStorage';
import { getBucketName } from '../dataLayer/todoStorage';
import { getUserId } from '../lambda/utils';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { CreateSignedURLRequest } from '../requests/CreateSignedURLRequest';
import { TodoItem } from '../models/TodoItem';

const todosAccess = new TodosDB();

export async function createTodo(event: APIGatewayProxyEvent,
                                 createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4();
    const userId = getUserId(event);
    const createdAt = new Date(Date.now()).toISOString();

    const todoItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: `https://${getBucketName()}.s3.amazonaws.com/${todoId}`,
        ...createTodoRequest
    };

    await todosAccess.addTodo(todoItem);

    return todoItem;
}

export async function deleteTodo(event: APIGatewayProxyEvent) {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    if (!(await todosAccess.getTodo(todoId, userId))) {
        return false;
    }

    await todosAccess.deleteTodo(todoId, userId);

    return true;
}

export async function getTodo(event: APIGatewayProxyEvent) {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    return await todosAccess.getTodo(todoId, userId);
}

export async function getAllTodos(event: APIGatewayProxyEvent) {
    const userId = getUserId(event);

    return await todosAccess.getAllTodos(userId);
}

export async function updateTodo(event: APIGatewayProxyEvent) {

    const updateTodoRequest: UpdateTodoRequest = JSON.parse(event.body);
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    if (!(await todosAccess.getTodo(todoId, userId))) {
        return false;
    }

    await todosAccess.updateTodo(todoId, userId, updateTodoRequest);

    return true;
}

export async function generateUploadUrl(event: APIGatewayProxyEvent) {
    const bucket = getBucketName();
    const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
    const todoId = event.pathParameters.todoId;

    const createSignedUrlRequest: CreateSignedURLRequest = {
        Bucket: bucket,
        Key: todoId,
        Expires: urlExpiration
    }

    return getPresignedUploadURL(createSignedUrlRequest);
}