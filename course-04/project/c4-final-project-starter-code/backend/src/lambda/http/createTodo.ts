import 'source-map-support/register'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { TodoItem } from '../../models/TodoItem'
import { createDocumentClient } from '../../cloud/aws'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
const todoTable = process.env.TODO_TABLE
const docClient = createDocumentClient();

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const todoId = uuid.v4();
  const userId: string = getUserId(event);
  const createdAt:string = new Date().toString();
  const done:boolean = false;
  const newTodoItem: TodoItem = {
    userId,
    todoId,
    createdAt,
    ...newTodo,
    done
  };

  await docClient.put({
    TableName: todoTable,
    Item: newTodoItem
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      item : newTodoItem
    })
  };
})

handler.use(
  cors({
    credentials: true
  })
)