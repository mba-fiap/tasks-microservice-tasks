import { Status } from '@/enums/status.enum'
import { Task } from '@prisma/client'

import { TasksRepository } from '@/repositories/tasks-repository'

import { TaskNotFound } from './errors/task-not-found-error'

interface CompleteUseCaseRequest {
  id: string
  userId: string
}

export class CompleteUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({ id, userId }: CompleteUseCaseRequest): Promise<Task> {
    const task = await this.tasksRepository.findById(id, userId)

    if (!task) {
      throw new TaskNotFound(id)
    }

    if (!task.completionDate) {
      task.completionDate = new Date()

      task.status = Status.INACTIVE

      await this.tasksRepository.save(task)
    }

    return task
  }
}
