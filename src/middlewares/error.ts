import { RouterContext } from '@koa/router'
import { formatError } from '../utils/error.js'

export default function error (ctx: RouterContext, error: Error | string = 'Error', status = 500, message = 'Unknown error'): void {
  if (error == null) error = 'Error'
  if (process.env.NODE_ENV === 'development') console.error(error)

  let needRefresh
  if (error instanceof Error) {
    needRefresh = (error.cause as any).needRefresh
    error = error.message
  }

  ctx.response.status = status
  ctx.body = formatError({
    error,
    status,
    message,
    needRefresh
  })
}
