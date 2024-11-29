import { Task, Prisma, Status } from '@prisma/client'
import { randomUUID } from 'node:crypto'

import { TasksRepository } from '@/repositories/tasks-repository'

export class InMemoryTasksRepository implements TasksRepository {
  public items: Task[] = []

  async findById(id: string, userId: string): Promise<Task | null> {
    const task = this.items.find(
      (item) => item.id === id && item.userId === userId
    )

    if (!task) {
      return null
    }

    return task
  }

  async findByTitle(title: string): Promise<Task | null> {
    const task = this.items.find((item) => item.title === title)

    if (!task) {
      return null
    }

    return task
  }

  async findMany(filter: Prisma.TaskWhereInput): Promise<Task[]> {
    return this.items.filter((item) => {
      const matchesUserId = filter.userId ? item.userId === filter.userId : true

      const matchesTitle =
        filter.title &&
        typeof filter.title === 'object' &&
        'contains' in filter.title
          ? item.title.includes(filter.title.contains as string)
          : true

      const matchesDate =
        filter.date &&
        typeof filter.date === 'object' &&
        'gte' in filter.date &&
        'lte' in filter.date
          ? item.date >= (filter.date.gte as Date) &&
            item.date <= (filter.date.lte as Date)
          : true

      const matchesStatus = filter.status ? item.status === filter.status : true

      return matchesUserId && matchesTitle && matchesDate && matchesStatus
    })
  }

  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    const task: Task = {
      id: randomUUID(),
      title: data.title,
      date: data.date instanceof Date ? data.date : new Date(data.date),
      userId: data.userId,
      createdAt: new Date(),
      completionDate: null,
      status: Status.PENDING,
    }

    this.items.push(task)

    return task
  }

  async save(task: Task): Promise<Task> {
    const index = this.items.findIndex((item) => item.id === task.id)

    if (index === -1) {
      throw new Error('Task not found')
    }

    this.items[index] = task

    return task
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id)
  }
}
