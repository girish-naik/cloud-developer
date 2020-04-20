import { CreateTodoRequest } from "./CreateTodoRequest";

/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateTodoRequest extends CreateTodoRequest {
  done: boolean
}