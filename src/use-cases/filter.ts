import { Status } from '@/enums/status.enum'
import { Prisma, Task } from '@prisma/client'

import { TasksRepository } from '@/repositories/tasks-repository'

interface FilterUseCaseRequest {
  title?: string
  start?: Date
  end?: Date
  status?: Status
  userId: string
}

export class FilterUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    title,
    start,
    end,
    status,
    userId,
  }: FilterUseCaseRequest): Promise<Task[] | undefined> {
    const filter: Prisma.TaskWhereInput = {
      userId,
    }

    if (title) {
      filter.title = { contains: title }
    }

    console.log('start', start)

    console.log('end', end)

    if (start || end) {
      filter.date = {
        gte: start,
        lte: end,
      }
    }

    if (status) {
      filter.status = status
    }

    console.log('filter', filter)

    const tasks = await this.tasksRepository.findMany(filter)

    return tasks
  }
}
