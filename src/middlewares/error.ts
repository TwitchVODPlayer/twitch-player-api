import { RouterContext } from '@koa/router'
import { formatError } from '../utils/error.js'

export default function error (ctx: RouterContext, error: Error | string = 'Error', status = 500, message = 'Unknown error', needRefresh = false): void {
  if (error == null) error = 'Error'
  if (process.env.NODE_ENV === 'development') console.error(error)
  if (error instanceof Error) error = error.message

  ctx.response.status = status
  ctx.body = formatError({
    error,
    status,
    message,
    needRefresh
  })
}
