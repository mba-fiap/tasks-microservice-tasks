import { app } from '@/app'
import { Status } from '@/enums/status.enum'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { prisma } from '@/lib/prisma'

import { TaskNotFound } from '@/use-cases/errors/task-not-found-error'
import { UserNotAllowedError } from '@/use-cases/errors/user-not-allowed'

import { generateAuthToken } from '@/utils/test/generate-auth-token'

describe('Complete Task (e2e)', () => {
  let token: string

  const userId = 'user-id-123'

  const taskId = randomUUID()

  beforeAll(async () => {
    await app.ready()

    token = await generateAuthToken(app, userId)

    await prisma.task.create({
      data: {
        id: taskId,
        title: 'Initial Task',
        date: new Date(),
        status: Status.ACTIVE,
        userId,
      },
    })
  })

  afterAll(async () => {
    await prisma.task.deleteMany()

    await app.close()
  })

  it('should complete a task successfully', async () => {
    const response = await request(app.server)
      .post(`/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(201)

    expect(response.body).toEqual(
      expect.objectContaining({
        id: taskId,
        title: 'Initial Task',
        status: Status.INACTIVE,
        date: expect.any(String),
        completionDate: expect.any(String),
        createdAt: expect.any(String),
      })
    )
  })

  it('should return 401 if user is not authenticated', async () => {
    const response = await request(app.server).post(`/tasks/${taskId}/complete`)

    expect(response.statusCode).toEqual(401)

    expect(response.body).toEqual({
      message: new UserNotAllowedError().message,
    })
  })

  it('should return 404 if task does not exist', async () => {
    const nonExistentTaskId = randomUUID()

    const response = await request(app.server)
      .post(`/tasks/${nonExistentTaskId}/complete`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(404)

    expect(response.body).toEqual({
      message: new TaskNotFound(nonExistentTaskId).message,
    })
  })
})
