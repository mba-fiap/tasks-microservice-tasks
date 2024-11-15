import { Task } from '@prisma/client'

import { TasksRepository } from '@/repositories/tasks-repository'

interface CreateUseCaseRequest {
  title: string
  date: Date
  userId: string
}

interface CreateUseCaseResponse {
  task: Task
}

export class CreateUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    title,
    date,
    userId,
  }: CreateUseCaseRequest): Promise<CreateUseCaseResponse> {
    const task = await this.tasksRepository.create({
      title,
      date,
      userId,
    })

    return {
      task,
    }
  }
}
