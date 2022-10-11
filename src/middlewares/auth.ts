import { RouterContext } from '@koa/router'
import { fetchAPI } from '../controllers/twitch.js'
import jwt from 'jsonwebtoken'
import error from './error.js'
import { Next } from 'koa'

export async function tokenRequired (ctx: RouterContext, next: Next): Promise<void> {
  const auth = ctx.headers.authorization?.split(' ')?.[1]
  if (auth == null) return error(ctx, 'Missing Token', 401, 'Missing bearer token')

  const tokens = await new Promise((resolve) => {
    jwt.verify(auth, process.env.JWT_KEY ?? 'r4nd0mk3y', {}, (err, tokens) => {
      if (err != null) return error(ctx, err.message, 401, 'Invalid token')
      if (tokens == null) return error(ctx, undefined, 401, 'Token is empty or null')
      resolve(tokens)
    })
  })
  ctx.state.user = tokens
  await next()
}

export async function setUserId (ctx: RouterContext, next: Next): Promise<void> {
  if (ctx.state.user?.access_token == null) return error(ctx, 'Missing Token', 401, 'Missing access token')

  const data = await fetchAPI('users', ctx.state.user.access_token).catch(err => error(ctx, err, 400, 'Could not get user id'))
  ctx.state.user.id = data.data[0].id
  await next()
}
