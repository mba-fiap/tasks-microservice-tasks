import { FastifyRequest } from 'fastify'

import { UserNotAllowedError } from '@/use-cases/errors/user-not-allowed'

export async function verifyJwt(request: FastifyRequest) {
  try {
    // const userId = request.user.sub

    // bater em algum lugar pra verificar se o userId é válido

    await request.jwtVerify()
  } catch {
    throw new UserNotAllowedError()
  }
}
