import { Prisma, Task } from '@prisma/client'

export interface TasksRepository {
  findById(id: string, userId: string): Promise<Task | null>
  findByTitle(title: string): Promise<Task | null>
  findMany(filter: Prisma.TaskWhereInput): Promise<Task[] | undefined>
  create(data: Prisma.TaskCreateInput): Promise<Task>
  save(task: Task): Promise<Task>
}
