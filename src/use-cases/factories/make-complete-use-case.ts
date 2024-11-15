import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository'

import { CompleteUseCase } from '@/use-cases/complete'

export function makeCompleteUseCase() {
  const tasksRepository = new PrismaTasksRepository()

  const completeUseCase = new CompleteUseCase(tasksRepository)

  return completeUseCase
}
