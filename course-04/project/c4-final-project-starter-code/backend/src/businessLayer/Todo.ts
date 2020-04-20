import * as uuid from 'uuid'
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import * as dataLayer from '../dataLayer/TodoAccess';
import * as fileStore from '../dataLayer/AttachmentFileStore';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { TodoUpdate } from '../models/TodoUpdate';

export async function createTodo(creatoTodoRequest : CreateTodoRequest, userId : string) : Promise<TodoItem> {
    const todoId = uuid.v4();
    const createdAt:string = new Date().toString();
    const done:boolean = false;
    const newTodoItem: TodoItem = {
        userId,
        todoId,
        createdAt,
        ...creatoTodoRequest,
        done
    };
    await dataLayer.insertTodo(newTodoItem);
    return Promise.resolve(newTodoItem);
}

export async function getTodos(userId : string) : Promise<TodoItem[]>{
    const todos: TodoItem[] = await dataLayer.getTodos(userId);
    for (var i = 0; i < todos.length; i++) {
        todos[i].attachmentUrl = await fileStore.getDownloadUrl(todos[i].todoId);
    }
    return todos;
}

export async function getUploadUrl(userId : string, todoId : string) : Promise<string> {
    await dataLayer.getTodo(userId, todoId);
    return Promise.resolve(fileStore.getUploadUrl(todoId));
}

export async function deleteTodo(userId : string, todoId : string) {
    await dataLayer.deleteTodo(userId, todoId);
    await fileStore.deleteAttachment(todoId);
}

export async function updateTodo(updateTodoRequest : UpdateTodoRequest, userId : string, todoId : string) {
    const todoUpdate: TodoUpdate = {
        ...updateTodoRequest
    };
    await dataLayer.updateTodo(userId, todoId, todoUpdate);
}