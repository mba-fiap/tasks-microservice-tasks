import { FastifyReply, FastifyRequest } from 'fastify'
import { container } from 'tsyringe'

import { env } from '@/env'

import { ICacheProviderModel } from '@/shared/providers/CacheProvider/ICacheProviderModel'

import { UserNotAllowedError } from '@/use-cases/errors/user-not-allowed'

import { createApi } from '@/utils/api'

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  const cacheProvider = container.resolve<ICacheProviderModel>('CacheProvider')

  try {
    const { sub: userId } = (await request.jwtVerify()) as {
      sub: string
    }

    const user = await cacheProvider.recover({
      key: `user:${userId}`,
    })

    if (!user) {
      const api = createApi(env.REGISTER_MICROSERVICE_API_URL)

      console.log(2222, request.headers.authorization)

      const { data } = await api.get('/users', {
        headers: {
          Authorization: request.headers.authorization,
        },
      })

      if (data) {
        await cacheProvider.save({
          key: `user:${userId}`,
          value: data,
        })
      } else {
        return reply
          .status(401)
          .send({ message: new UserNotAllowedError().message })
      }
    }
  } catch (err) {
    console.log(err)

    return reply
      .status(401)
      .send({ message: new UserNotAllowedError().message })
  }
}
