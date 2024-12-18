import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastify from 'fastify'
import 'reflect-metadata'
import { ZodError } from 'zod'

import { env } from '@/env'

import { appRoutes } from '@/http/controllers/routes'

import '@/shared'

import './listeners'

import { appSwagger } from './swagger'

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

appSwagger(app)

app.register(appRoutes)

app.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.validation,
    })
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.errors,
    })
  }

  return reply.status(500).send({ message: 'Internal server error' })
})
