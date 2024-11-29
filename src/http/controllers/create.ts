import { Status } from '@/enums/status.enum'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

import { UserNotAllowedError } from '@/use-cases/errors/user-not-allowed'
import { makeCreateUseCase } from '@/use-cases/factories/make-create-use-case'

const createBodySchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
})

const createContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.date(),
  completionDate: z.date().optional(),
  status: z.enum(Object.values(Status) as [Status, ...Status[]]),
  createdAt: z.date(),
})

export const createSchema = {
  tags: ['Tasks'],
  security: [
    {
      bearerAuth: [],
    },
  ],
  body: zodToJsonSchema(createBodySchema),
  response: {
    201: {
      description: 'Task created successfully',
      content: {
        'application/json': {
          schema: zodToJsonSchema(createContentSchema),
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

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const { title, date } = createBodySchema.parse(request.body)

  try {
    const createUseCase = makeCreateUseCase()

    const task = await createUseCase.execute({
      title,
      date,
      userId: request.user.sub,
    })

    return reply.status(201).send(task)
  } catch (err) {
    if (err instanceof UserNotAllowedError) {
      return reply.status(401).send({ message: err.message })
    }

    throw err
  }
}
