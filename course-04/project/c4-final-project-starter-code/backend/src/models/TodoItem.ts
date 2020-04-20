import { TodoUpdate } from "./TodoUpdate";

export interface TodoItem extends TodoUpdate {
  userId: string
  todoId: string
  createdAt: string
  attachmentUrl?: string
}
