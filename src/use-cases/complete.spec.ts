import { Status } from '@/enums/status.enum'
import { expect, describe, it, beforeEach } from 'vitest'

import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository'

import { CompleteUseCase } from './complete'
import { TaskNotFound } from './errors/task-not-found-error'

let tasksRepository: InMemoryTasksRepository

let sut: CompleteUseCase

describe('Complete Use Case', () => {
  beforeEach(() => {
    tasksRepository = new InMemoryTasksRepository()
    sut = new CompleteUseCase(tasksRepository)
  })

  it('should mark a task as completed', async () => {
    const task = await tasksRepository.create({
      title: 'Task to Complete',
      date: new Date(),
      userId: 'user-1',
    })

    const completedTask = await sut.execute({
      id: task.id,
      userId: 'user-1',
    })

    expect(completedTask.completionDate).toBeInstanceOf(Date)

    expect(completedTask.status).toBe(Status.INACTIVE)
  })

  it('should not update the completion date or status if already completed', async () => {
    const completionDate = new Date()

    const task = await tasksRepository.create({
      title: 'Already Completed Task',
      date: new Date(),
      userId: 'user-1',
    })

    task.completionDate = completionDate

    task.status = Status.INACTIVE

    await tasksRepository.save(task)

    const completedTask = await sut.execute({
      id: task.id,
      userId: 'user-1',
    })

    expect(completedTask.completionDate).toEqual(completionDate)

    expect(completedTask.status).toBe(Status.INACTIVE)
  })

  it('should throw TaskNotFound if the task does not exist', async () => {
    await expect(() =>
      sut.execute({
        id: 'non-existing-id',
        userId: 'user-1',
      })
    ).rejects.toBeInstanceOf(TaskNotFound)
  })

  it('should only complete tasks for the correct user', async () => {
    const task = await tasksRepository.create({
      title: 'Task to Complete',
      date: new Date(),
      userId: 'user-1',
    })

    await expect(() =>
      sut.execute({
        id: task.id,
        userId: 'user-2',
      })
    ).rejects.toBeInstanceOf(TaskNotFound)
  })
})
