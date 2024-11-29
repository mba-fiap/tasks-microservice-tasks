import { FastifyReply, FastifyRequest } from 'fastify'

import { UserNotAllowedError } from '@/use-cases/errors/user-not-allowed'

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    // const userId = request.user.sub

    // bater em algum lugar pra verificar se o userId é válido

    await request.jwtVerify()
  } catch {
    return reply
      .status(401)
      .send({ message: new UserNotAllowedError().message })
  }
}
