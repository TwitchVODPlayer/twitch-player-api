import { Middleware } from '@koa/router'
import rateLimit from 'koa-ratelimit'

const db = new Map()

const DEFAULT_OPTIONS: rateLimit.MiddlewareOptions = {
  driver: 'memory',
  db,
  errorMessage: 'Too many requests'
}

function setRateLimit (options: Partial<rateLimit.MiddlewareOptions>): Middleware {
  return rateLimit({
    ...DEFAULT_OPTIONS,
    ...options
  })
}

export const defaultLimit = setRateLimit({
  duration: 60 * 1000,
  max: 100
})

export const apiLimit = setRateLimit({
  duration: 10 * 1000,
  max: 50
})

export const vodLimit = setRateLimit({
  duration: 10 * 1000,
  max: 100
})

export const historyLimit = setRateLimit({
  duration: 10 * 1000,
  max: 20
})
