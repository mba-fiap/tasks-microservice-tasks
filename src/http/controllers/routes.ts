import { FastifyInstance } from 'fastify'

import { verifyJwt } from '@/http/middlewares/verify-jwt'

import { complete, completeSchema } from './complete'
import { create, createSchema } from './create'
import { filter, filterSchema } from './filter'
import { update, updateSchema } from './update'

export async function appRoutes(app: FastifyInstance) {
  app.post('/tasks', {
    onRequest: [verifyJwt],
    handler: create,
    schema: createSchema,
  })

  app.put('/tasks/:id', {
    onRequest: [verifyJwt],
    handler: update,
    schema: updateSchema,
  })

  app.post('/tasks/:id/complete', {
    onRequest: [verifyJwt],
    handler: complete,
    schema: completeSchema,
  })

  app.get('/tasks', {
    onRequest: [verifyJwt],
    handler: filter,
    schema: filterSchema,
  })
}
