import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository'

import { CreateUseCase } from '@/use-cases/create'

export function makeCreateUseCase() {
  const tasksRepository = new PrismaTasksRepository()

  const createUseCase = new CreateUseCase(tasksRepository)

  return createUseCase
}
