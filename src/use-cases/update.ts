import { Task } from '@prisma/client'

import { TasksRepository } from '@/repositories/tasks-repository'

import { Status } from '@/enums/status.enum'

import { TaskNotFound } from './errors/task-not-found-error'

interface UpdateUseCaseRequest {
  id: string
  title?: string
  date?: Date
  status?: Status
  userId: string
}

interface UpdateUseCaseResponse {
  task: Task
}

export class UpdateUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    id,
    title,
    date,
    status,
    userId,
  }: UpdateUseCaseRequest): Promise<UpdateUseCaseResponse> {
    const task = await this.tasksRepository.findById(id, userId)

    if (!task) {
      throw new TaskNotFound(id)
    }

    task.title = title ?? task.title

    task.date = date ?? task.date

    task.status = status ?? task.status

    await this.tasksRepository.save(task)

    return {
      task,
    }
  }
}
