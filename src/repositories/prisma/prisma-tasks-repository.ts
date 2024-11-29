import { Task, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

import { TasksRepository } from '@/repositories/tasks-repository'

export class PrismaTasksRepository implements TasksRepository {
  async findById(id: string, userId: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: {
        id,
        userId,
      },
    })
  }

  async findByTitle(title: string): Promise<Task | null> {
    return prisma.task.findFirst({
      where: {
        title,
      },
    })
  }

  async findMany(filter: Prisma.TaskWhereInput): Promise<Task[]> {
    return prisma.task.findMany({
      where: filter,
    })
  }

  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return prisma.task.create({
      data,
    })
  }

  async save(task: Task): Promise<Task> {
    return prisma.task.update({
      where: {
        id: task.id,
      },
      data: task,
    })
  }
}
