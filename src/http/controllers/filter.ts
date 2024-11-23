import { FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod'

import { zodToJsonSchema } from 'zod-to-json-schema'

import { makeFilterUseCase } from '@/use-cases/factories/make-filter-use-case'

import { Status } from '@/enums/status.enum'

import { UserNotAllowedError } from '@/use-cases/errors/user-not-allowed'

const filterQuerySchema = z.object({
  title: z.string().optional(),
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
  status: z.enum(Object.values(Status) as [Status, ...Status[]]).optional(),
})

const filterContentSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    date: z.date(),
    completionDate: z.date().optional(),
    status: z.enum(Object.values(Status) as [Status, ...Status[]]),
    createdAt: z.date(),
  })
)

export const filterSchema = {
  tags: ['Tasks'],
  security: [
    {
      bearerAuth: [],
    },
  ],
  queryObjects: zodToJsonSchema(filterQuerySchema),
  response: {
    201: {
      description: 'Tasks filtered successfully',
      content: {
        'application/json': {
          schema: zodToJsonSchema(filterContentSchema),
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
  },
}

export async function filter(request: FastifyRequest, reply: FastifyReply) {
  const { title, start, end, status } = filterQuerySchema.parse(request.query)

  try {
    const createUseCase = makeFilterUseCase()

    const tasks = await createUseCase.execute({
      title,
      start,
      end,
      status,
      userId: request.user.sub,
    })

    return reply.status(201).send(tasks)
  } catch (err) {
    if (err instanceof UserNotAllowedError) {
      return reply.status(401).send({ message: err.message })
    }

    throw err
  }
}
