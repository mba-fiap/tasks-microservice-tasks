import { FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod'

import { makeFilterUseCase } from '@/use-cases/factories/make-filter-use-case'

import { Status } from '@/enums/status.enum'

export async function filter(request: FastifyRequest, reply: FastifyReply) {
  const filterBodySchema = z.object({
    title: z.string().optional(),
    dateRange: z
      .object({
        start: z.date(),
        end: z.date(),
      })
      .optional(),
    status: z.enum(Object.values(Status) as [Status, ...Status[]]).optional(),
  })

  const { title, dateRange, status } = filterBodySchema.parse(request.body)

  const token = request.headers.authorization?.replace('Bearer ', '')

  console.log('token', token)

  const createUseCase = makeFilterUseCase()

  const tasks = await createUseCase.execute({
    title,
    dateRange,
    status,
    userId: '',
  })

  return reply.status(201).send(tasks)
}
