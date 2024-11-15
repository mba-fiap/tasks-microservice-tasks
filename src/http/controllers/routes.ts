import { FastifyInstance } from 'fastify'

import { create } from './create'

import { update } from './update'

import { complete } from './complete'

import { filter } from './filter'

export async function appRoutes(app: FastifyInstance) {
  app.post('/tasks', create)

  app.put('/tasks/:id', update)

  app.put('/tasks/:id/complete', complete)

  app.get('/tasks', filter)
}
