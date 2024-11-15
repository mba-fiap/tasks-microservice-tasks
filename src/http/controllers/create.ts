import { FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod'

import { makeCreateUseCase } from '@/use-cases/factories/make-create-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createBodySchema = z.object({
    title: z.string(),
    date: z.date(),
  })

  const { title, date } = createBodySchema.parse(request.body)

  const token = request.headers.authorization?.replace('Bearer ', '')

  console.log('token', token)

  const createUseCase = makeCreateUseCase()

  const task = await createUseCase.execute({
    title,
    date,
    userId: '',
  })

  return reply.status(201).send(task)
}
