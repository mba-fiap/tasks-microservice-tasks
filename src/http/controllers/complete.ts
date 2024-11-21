import { FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod'

import { zodToJsonSchema } from 'zod-to-json-schema'

import { makeCompleteUseCase } from '@/use-cases/factories/make-complete-use-case'

import { Status } from '@/enums/status.enum'

import { TaskNotFound } from '@/use-cases/errors/task-not-found-error'

import { UserNotAllowedError } from '@/use-cases/errors/user-not-allowed'

const completeParamsSchema = z.object({
  id: z.string().uuid(),
})

const completeContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.date(),
  completionDate: z.date().optional(),
  status: z.enum(Object.values(Status) as [Status, ...Status[]]),
  createdAt: z.date(),
})

export const completeSchema = {
  tags: ['Tasks'],
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: zodToJsonSchema(completeParamsSchema),
  response: {
    201: {
      description: 'Task completed successfully',
      content: {
        'application/json': {
          schema: zodToJsonSchema(completeContentSchema),
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

export async function complete(request: FastifyRequest, reply: FastifyReply) {
  const { id } = completeParamsSchema.parse(request.params)

  try {
    const completeUseCase = makeCompleteUseCase()

    const task = await completeUseCase.execute({
      id,
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
