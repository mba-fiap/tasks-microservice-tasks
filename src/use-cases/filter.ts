import { Prisma, Task } from '@prisma/client'

import { TasksRepository } from '@/repositories/tasks-repository'

import { Status } from '@/enums/status.enum'

interface FilterUseCaseRequest {
  title?: string
  dateRange?: {
    start: Date
    end: Date
  }
  status?: Status
  userId: string
}

interface FilterUseCaseResponse {
  tasks: Task[] | undefined
}

export class FilterUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    title,
    dateRange,
    status,
    userId,
  }: FilterUseCaseRequest): Promise<FilterUseCaseResponse> {
    const filter: Prisma.TaskWhereInput = {
      userId,
    }

    if (title) {
      filter.title = { contains: title }
    }

    if (dateRange) {
      filter.date = {
        gte: dateRange.start,
        lte: dateRange.end,
      }
    }

    if (status) {
      filter.status = status
    }

    const tasks = await this.tasksRepository.findMany(filter)

    return { tasks }
  }
}
