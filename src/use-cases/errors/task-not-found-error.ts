export class TaskNotFound extends Error {
  constructor(id?: string) {
    super(`Task '${id}' not found.`)
  }
}
