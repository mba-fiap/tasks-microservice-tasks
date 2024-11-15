import { FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod'

import { makeUpdateUseCase } from '@/use-cases/factories/make-update-use-case'

import { Status } from '@/enums/status.enum'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const updateBodySchema = z.object({
    title: z.string().optional(),
    date: z.date().optional(),
    status: z.enum(Object.values(Status) as [Status, ...Status[]]).optional(),
  })

  const { id } = updateParamsSchema.parse(request.params)

  const { title, date, status } = updateBodySchema.parse(request.body)

  const token = request.headers.authorization?.replace('Bearer ', '')

  console.log('token', token)

  const updateUseCase = makeUpdateUseCase()

  const task = await updateUseCase.execute({
    id,
    title,
    date,
    status,
    userId: '',
  })

  return reply.status(201).send(task)
}
