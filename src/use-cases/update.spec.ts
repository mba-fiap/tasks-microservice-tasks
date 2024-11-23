import { expect, describe, it, beforeEach } from 'vitest'

import { UpdateUseCase } from './update'

import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository'

import { Status } from '@/enums/status.enum'

import { TaskNotFound } from './errors/task-not-found-error'

let tasksRepository: InMemoryTasksRepository

let sut: UpdateUseCase

describe('Update Use Case', () => {
  beforeEach(() => {
    tasksRepository = new InMemoryTasksRepository()
    sut = new UpdateUseCase(tasksRepository)
  })

  it('should update a task title', async () => {
    const task = await tasksRepository.create({
      title: 'Old Title',
      date: new Date(),
      userId: 'user-1',
    })

    const updatedTask = await sut.execute({
      id: task.id,
      title: 'New Title',
      userId: 'user-1',
    })

    expect(updatedTask.title).toBe('New Title')

    expect(updatedTask.date).toEqual(task.date)

    expect(updatedTask.status).toBe(task.status)
  })

  it('should update a task date', async () => {
    const task = await tasksRepository.create({
      title: 'Task Title',
      date: new Date('2023-01-01'),
      userId: 'user-1',
    })

    const newDate = new Date('2024-01-01')

    const updatedTask = await sut.execute({
      id: task.id,
      date: newDate,
      userId: 'user-1',
    })

    expect(updatedTask.date).toEqual(newDate)

    expect(updatedTask.title).toBe(task.title)
  })

  it('should update a task status', async () => {
    const task = await tasksRepository.create({
      title: 'Task Title',
      date: new Date(),
      userId: 'user-1',
    })

    const updatedTask = await sut.execute({
      id: task.id,
      status: Status.INACTIVE,
      userId: 'user-1',
    })

    expect(updatedTask.status).toBe(Status.INACTIVE)
  })

  it('should throw TaskNotFound if the task does not exist', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existing-id',
        userId: 'user-1',
        title: 'New Title',
      })
    ).rejects.toBeInstanceOf(TaskNotFound)
  })

  it('should not update fields that are not provided', async () => {
    const task = await tasksRepository.create({
      title: 'Task Title',
      date: new Date(),
      userId: 'user-1',
    })

    const updatedTask = await sut.execute({
      id: task.id,
      userId: 'user-1',
    })

    expect(updatedTask.title).toBe(task.title)

    expect(updatedTask.date).toEqual(task.date)

    expect(updatedTask.status).toBe(task.status)
  })

  it('should only update the task for the correct user', async () => {
    const task = await tasksRepository.create({
      title: 'Task Title',
      date: new Date(),
      userId: 'user-1',
    })

    await expect(() =>
      sut.execute({
        id: task.id,
        userId: 'user-2',
        title: 'Another User Update',
      })
    ).rejects.toBeInstanceOf(TaskNotFound)
  })
})
