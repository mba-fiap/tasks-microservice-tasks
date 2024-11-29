import { app } from '@/app'
import { Status } from '@/enums/status.enum'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { prisma } from '@/lib/prisma'

import { TaskNotFound } from '@/use-cases/errors/task-not-found-error'
import { UserNotAllowedError } from '@/use-cases/errors/user-not-allowed'

import { generateAuthToken } from '@/utils/test/generate-auth-token'

describe('Update Task (e2e)', () => {
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
        status: Status.PENDING,
        userId,
      },
    })
  })

  afterAll(async () => {
    await prisma.task.deleteMany()

    await app.close()
  })

  it('should update a task successfully', async () => {
    const response = await request(app.server)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Task',
        status: Status.ACTIVE,
      })

    expect(response.statusCode).toEqual(201)

    expect(response.body).toEqual(
      expect.objectContaining({
        id: taskId,
        title: 'Updated Task',
        status: Status.ACTIVE,
        date: expect.any(String),
        createdAt: expect.any(String),
      })
    )
  })

  it('should return 401 if user is not authenticated', async () => {
    const response = await request(app.server).put(`/tasks/${taskId}`).send({
      title: 'Unauthorized Update',
    })

    expect(response.statusCode).toEqual(401)

    expect(response.body).toEqual({
      message: new UserNotAllowedError().message,
    })
  })

  it('should return 404 if task does not exist', async () => {
    const nonExistentTaskId = randomUUID()

    const response = await request(app.server)
      .put(`/tasks/${nonExistentTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Non-existent Task Update',
      })

    expect(response.statusCode).toEqual(404)

    expect(response.body).toEqual({
      message: new TaskNotFound(nonExistentTaskId).message,
    })
  })

  it('should validate input data', async () => {
    const response = await request(app.server)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '',
        date: 'invalid-date',
      })

    expect(response.statusCode).toEqual(400)

    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      })
    )
  })
})
