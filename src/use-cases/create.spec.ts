import { expect, describe, it, beforeEach } from 'vitest'

import { CreateUseCase } from './create'

import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository'

let tasksRepository: InMemoryTasksRepository

let sut: CreateUseCase

describe('Create Use Case', () => {
  beforeEach(() => {
    tasksRepository = new InMemoryTasksRepository()
    sut = new CreateUseCase(tasksRepository)
  })

  it('should create a task', async () => {
    const taskData = {
      title: 'Complete the report',
      date: new Date(),
      userId: 'user-1',
    }

    const task = await sut.execute(taskData)

    expect(task).toMatchObject({
      id: expect.any(String),
      title: 'Complete the report',
      date: taskData.date,
      userId: 'user-1',
    })
  })

  it('should assign a unique ID to each created task', async () => {
    const task1 = await sut.execute({
      title: 'Task 1',
      date: new Date(),
      userId: 'user-1',
    })

    const task2 = await sut.execute({
      title: 'Task 2',
      date: new Date(),
      userId: 'user-2',
    })

    expect(task1.id).not.toBe(task2.id)
  })
})
