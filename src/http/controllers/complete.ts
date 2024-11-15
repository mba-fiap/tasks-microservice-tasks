import { FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod'

import { makeCompleteUseCase } from '@/use-cases/factories/make-complete-use-case'

export async function complete(request: FastifyRequest, reply: FastifyReply) {
  const completeParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = completeParamsSchema.parse(request.params)

  const token = request.headers.authorization?.replace('Bearer ', '')

  console.log('token', token)

  const completeUseCase = makeCompleteUseCase()

  const task = await completeUseCase.execute({
    id,
    userId: '',
  })

  return reply.status(201).send(task)
}
