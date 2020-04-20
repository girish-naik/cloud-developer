import { createDocumentClient } from "../cloud/aws";
import { TodoItem } from "../models/TodoItem";
import { createLogger } from "../utils/logger";
import { TodoUpdate } from "../models/TodoUpdate";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
const todoTable = process.env.TODO_TABLE
const docClient = createDocumentClient();
const logger = createLogger("TodoAccess");
const userIdIndex = process.env.USER_ID_INDEX

export async function insertTodo(todo: TodoItem) {
    try {
        await docClient.put({
            TableName: todoTable,
            Item: todo
        }).promise();
    } catch (err) {
        logger.error("Error write new TODO to database.");
        throw err;
    }
}

export async function getTodos(userId: String) : Promise<TodoItem[]> {
    try {
        const result = await docClient.query({
            TableName : todoTable,
            IndexName : userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        const todos : TodoItem[] = [];
        result.Items.forEach(element => {
            todos.push(createTodo(element));
        });
        return Promise.resolve(todos)
    } catch (err) {
        logger.error("Error fetching TODOs for user.");
        throw err;
    }
}

export async function getTodo(userId : string, todoId : string) : Promise<TodoItem> {
    try {    
        const results = await docClient.query({
            TableName : todoTable,
            IndexName : userIdIndex,
            KeyConditionExpression: 'todoId = :todoId and userId = :userId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':userId': userId
            }
        }).promise()
        if (results.Count != 0) {
            return Promise.resolve(createTodo(results.Items[0]));
        }
    } catch (err) {
        logger.error("Error fetching TODO for user.");
        throw err;
    }
}

export async function deleteTodo(userId: string, todoId :string) : Promise<string> {
    try {
        await docClient.delete({
            TableName : todoTable,
            Key : {
              todoId,
              userId
            }
        }).promise()
        return Promise.resolve(todoId);
    } catch (err) {
        logger.error("Error deleting TODO for user.");
        throw err; 
    }
}

export async function updateTodo(userId : string, todoId : string, todo : TodoUpdate) {
    try {
    await docClient.update({
        TableName: todoTable,
        Key : {
          todoId,
          userId
        },
        UpdateExpression : "SET #nm = :name, dueDate = :dueDate, done = :done",
        ExpressionAttributeValues : {
          ':name' : todo.name,
          ':dueDate' : todo.dueDate,
          ':done' : todo.done
        },
        ExpressionAttributeNames : {
          "#nm": "name"
        }
      }).promise()
    } catch (err) {
        logger.error("Error updating TODO for user.");
        throw err; 
    }
}

function createTodo(dbItem : DocumentClient.AttributeMap) : TodoItem {
    const todo: TodoItem = {
        userId : dbItem.userId,
        todoId : dbItem.todoId,
        name : dbItem.name,
        createdAt : dbItem.createdAt,
        dueDate : dbItem.dueDate,
        done : dbItem.done
    }
    return todo;
}