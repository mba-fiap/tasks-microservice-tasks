import { FastifyInstance } from 'fastify'

export async function generateAuthToken(app: FastifyInstance, userId: string) {
  return app.jwt.sign({ sub: userId })
}
