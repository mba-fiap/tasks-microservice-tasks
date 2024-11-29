import request from 'supertest'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { app } from '@/app'

import { prisma } from '@/lib/prisma'

import { generateAuthToken } from '@/utils/test/generate-auth-token'

import { UserNotAllowedError } from '@/use-cases/errors/user-not-allowed'

describe('Create Task (e2e)', () => {
  let token: string

  const userId = 'user-id-123'

  beforeAll(async () => {
    await app.ready()

    token = await generateAuthToken(app, userId)
  })

  afterAll(async () => {
    await prisma.task.deleteMany()

    await app.close()
  })

  it('should create a task successfully', async () => {
    const response = await request(app.server)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        date: new Date().toISOString(),
      })

    expect(response.statusCode).toEqual(201)

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        title: 'Test Task',
        status: expect.any(String),
        date: expect.any(String),
        createdAt: expect.any(String),
        completionDate: expect.any(String),
      })
    )
  })

  it('should return 401 if user is not authenticated', async () => {
    const response = await request(app.server).post('/tasks').send({
      title: 'Unauthorized Task',
      date: new Date().toISOString(),
    })

    expect(response.statusCode).toEqual(401)

    expect(response.body).toEqual({
      message: new UserNotAllowedError().message,
    })
  })

  it('should validate input data', async () => {
    const response = await request(app.server)
      .post('/tasks')
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
