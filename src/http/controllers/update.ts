import { FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod'

import { zodToJsonSchema } from 'zod-to-json-schema'

import { makeUpdateUseCase } from '@/use-cases/factories/make-update-use-case'

import { Status } from '@/enums/status.enum'

import { TaskNotFound } from '@/use-cases/errors/task-not-found-error'

import { UserNotAllowedError } from '@/use-cases/errors/user-not-allowed'

const updateParamsSchema = z.object({
  id: z.string().uuid(),
})

const updateBodySchema = z.object({
  title: z.string().optional(),
  date: z.date().optional(),
  status: z.enum(Object.values(Status) as [Status, ...Status[]]).optional(),
})

const updateContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.date(),
  completionDate: z.date().optional(),
  status: z.enum(Object.values(Status) as [Status, ...Status[]]),
  createdAt: z.date(),
})

export const updateSchema = {
  tags: ['Tasks'],
  security: [
    {
      bearerAuth: [],
    },
  ],
  body: zodToJsonSchema(updateBodySchema),
  params: zodToJsonSchema(updateParamsSchema),
  response: {
    201: {
      description: 'Task updated successfully',
      content: {
        'application/json': {
          schema: zodToJsonSchema(updateContentSchema),
        },
      },
    },
    401: {
      description: new UserNotAllowedError().message,
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    404: {
      description: new TaskNotFound().message,
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const { id } = updateParamsSchema.parse(request.params)

  const { title, date, status } = updateBodySchema.parse(request.body)

  try {
    const updateUseCase = makeUpdateUseCase()

    const task = await updateUseCase.execute({
      id,
      title,
      date,
      status,
      userId: request.user.sub,
    })

    return reply.status(201).send(task)
  } catch (err) {
    if (err instanceof UserNotAllowedError) {
      return reply.status(401).send({ message: err.message })
    }

    if (err instanceof TaskNotFound) {
      return reply.status(404).send({ message: err.message })
    }

    throw err
  }
}
