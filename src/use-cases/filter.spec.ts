import { Status } from '@/enums/status.enum'
import { expect, describe, it, beforeEach } from 'vitest'

import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository'

import { FilterUseCase } from './filter'

let tasksRepository: InMemoryTasksRepository

let sut: FilterUseCase

describe('Filter Use Case', () => {
  beforeEach(() => {
    tasksRepository = new InMemoryTasksRepository()
    sut = new FilterUseCase(tasksRepository)
  })

  it('should filter tasks by title', async () => {
    await tasksRepository.create({
      title: 'Buy groceries',
      date: new Date(),
      userId: 'user-1',
    })

    await tasksRepository.create({
      title: 'Prepare presentation',
      date: new Date(),
      userId: 'user-1',
    })

    const tasks = await sut.execute({
      title: 'groceries',
      userId: 'user-1',
    })

    expect(tasks).toHaveLength(1)

    expect(tasks?.[0].title).toBe('Buy groceries')
  })

  it('should filter tasks by date range', async () => {
    await tasksRepository.create({
      title: 'Task 1',
      date: new Date('2024-01-01'),
      userId: 'user-1',
    })

    await tasksRepository.create({
      title: 'Task 2',
      date: new Date('2024-01-15'),
      userId: 'user-1',
    })

    await tasksRepository.create({
      title: 'Task 3',
      date: new Date('2024-02-01'),
      userId: 'user-1',
    })

    const tasks = await sut.execute({
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
      userId: 'user-1',
    })

    expect(tasks).toHaveLength(2)

    expect(tasks?.[0].title).toBe('Task 1')

    expect(tasks?.[1].title).toBe('Task 2')
  })

  it('should filter tasks by status', async () => {
    await tasksRepository.create({
      title: 'Pending Task',
      date: new Date(),
      userId: 'user-1',
      status: Status.PENDING,
    })

    await tasksRepository.create({
      title: 'Inactive Task',
      date: new Date(),
      userId: 'user-1',
      status: Status.INACTIVE,
    })

    const tasks = await sut.execute({
      status: Status.PENDING,
      userId: 'user-1',
    })

    expect(tasks?.[0].title).toBe('Pending Task')
  })

  it('should filter tasks by multiple criteria', async () => {
    await tasksRepository.create({
      title: 'Task 1',
      date: new Date('2024-01-01'),
      userId: 'user-1',
      status: Status.PENDING,
    })

    await tasksRepository.create({
      title: 'Task 2',
      date: new Date('2024-01-15'),
      userId: 'user-1',
      status: Status.PENDING,
    })

    await tasksRepository.create({
      title: 'Task 3',
      date: new Date('2024-01-15'),
      userId: 'user-2',
      status: Status.PENDING,
    })

    const tasks = await sut.execute({
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
      status: Status.PENDING,
      userId: 'user-1',
    })

    expect(tasks).toHaveLength(2)

    expect(tasks?.every((task) => task.userId === 'user-1')).toBe(true)
  })

  it('should return an empty array if no tasks match the filter', async () => {
    const tasks = await sut.execute({
      title: 'Non-existing Task',
      userId: 'user-1',
    })

    expect(tasks).toHaveLength(0)
  })
})
