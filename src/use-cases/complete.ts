import { Task } from '@prisma/client'

import { TasksRepository } from '@/repositories/tasks-repository'

import { Status } from '@/enums/status.enum'

import { TaskNotFound } from './errors/task-not-found-error'

interface CompleteUseCaseRequest {
  id: string
  userId: string
}

interface CompleteUseCaseResponse {
  task: Task
}

export class CompleteUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    id,
    userId,
  }: CompleteUseCaseRequest): Promise<CompleteUseCaseResponse> {
    const task = await this.tasksRepository.findById(id, userId)

    if (!task) {
      throw new TaskNotFound(id)
    }

    task.status = Status.INACTIVE

    await this.tasksRepository.save(task)

    return {
      task,
    }
  }
}
