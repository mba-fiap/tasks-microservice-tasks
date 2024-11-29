import { app } from '@/app'
import { Status } from '@/enums/status.enum'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { prisma } from '@/lib/prisma'

import { UserNotAllowedError } from '@/use-cases/errors/user-not-allowed'

import { generateAuthToken } from '@/utils/test/generate-auth-token'

describe('Filter Tasks (e2e)', () => {
  let token: string

  const userId = 'user-id-123'

  beforeAll(async () => {
    await app.ready()

    token = await generateAuthToken(app, userId)

    await prisma.task.createMany({
      data: [
        {
          id: randomUUID(),
          title: 'Task 1',
          date: new Date('2024-11-28T10:00:00Z'),
          status: Status.PENDING,
          userId,
        },
        {
          id: randomUUID(),
          title: 'Task 2',
          date: new Date('2024-11-29T10:00:00Z'),
          status: Status.INACTIVE,
          userId,
        },
        {
          id: randomUUID(),
          title: 'Another Task',
          date: new Date('2024-11-30T10:00:00Z'),
          status: Status.ACTIVE,
          userId,
        },
      ],
    })
  })

  afterAll(async () => {
    await prisma.task.deleteMany()

    await app.close()
  })

  it('should filter tasks successfully', async () => {
    const response = await request(app.server)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(201)

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          date: expect.any(String),
          status: expect.any(String),
          createdAt: expect.any(String),
        }),
      ])
    )
  })

  it('should return 401 if user is not authenticated', async () => {
    const response = await request(app.server).get('/tasks')

    expect(response.statusCode).toEqual(401)

    expect(response.body).toEqual({
      message: new UserNotAllowedError().message,
    })
  })

  it('should filter tasks by title', async () => {
    const response = await request(app.server)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .query({ title: 'Task 1' })

    expect(response.statusCode).toEqual(201)

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Task 1',
        }),
      ])
    )

    expect(response.body.length).toBe(1)
  })

  it('should filter tasks by date range', async () => {
    const response = await request(app.server)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .query({
        start: '2024-11-28T00:00:00Z',
        end: '2024-11-29T23:59:59Z',
      })

    expect(response.statusCode).toEqual(201)

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Task 1',
        }),
        expect.objectContaining({
          title: 'Task 2',
        }),
      ])
    )

    expect(response.body.length).toBe(2)
  })

  it('should filter tasks by status', async () => {
    const response = await request(app.server)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .query({ status: Status.INACTIVE })

    expect(response.statusCode).toEqual(201)

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: Status.INACTIVE,
        }),
      ])
    )

    expect(response.body.length).toBe(1)
  })
})
