import { FastifyInstance } from 'fastify'

import { verifyJwt } from '@/http/middlewares/verify-jwt'

import { create, createSchema } from './create'

import { update, updateSchema } from './update'

import { complete, completeSchema } from './complete'

import { filter, filterSchema } from './filter'

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

  app.put('/tasks/:id/complete', {
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
