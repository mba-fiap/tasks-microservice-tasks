import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository'

import { UpdateUseCase } from '@/use-cases/update'

export function makeUpdateUseCase() {
  const tasksRepository = new PrismaTasksRepository()

  const updateUseCase = new UpdateUseCase(tasksRepository)

  return updateUseCase
}
