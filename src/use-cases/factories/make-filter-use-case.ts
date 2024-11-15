import { PrismaTasksRepository } from '@/repositories/prisma/prisma-tasks-repository'

import { FilterUseCase } from '@/use-cases/filter'

export function makeFilterUseCase() {
  const tasksRepository = new PrismaTasksRepository()

  const filterUseCase = new FilterUseCase(tasksRepository)

  return filterUseCase
}
