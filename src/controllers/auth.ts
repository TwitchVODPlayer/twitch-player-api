import { RouterContext } from '@koa/router'
import jwt from 'jsonwebtoken'
import error from '../middlewares/error.js'
const {
  WEB_BASE_URL,
  TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_SCOPE,
  JWT_KEY, JWT_EXPIRE
} = process.env

export function loginUrl (ctx: RouterContext): void {
  ctx.body = { url: getLoginUrl() }
}

function getLoginUrl (): string {
  const url = new URL('https://id.twitch.tv/oauth2/authorize')
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: TWITCH_CLIENT_ID ?? '',
    redirect_uri: `${WEB_BASE_URL ?? ''}/login`,
    scope: TWITCH_SCOPE ?? '',
    state: getAuthState(TWITCH_CLIENT_ID ?? '', TWITCH_SCOPE ?? '')
  }).toString()
  return url.toString()
}

export async function login (ctx: RouterContext): Promise<void> {
  if (!validState(ctx.request.body.state, ctx.request.body.scope)) return error(ctx, 'Invalid State', 403, 'Invalid state value')
  return await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID ?? '',
      client_secret: TWITCH_CLIENT_SECRET ?? '',
      code: ctx.request.body.code,
      grant_type: 'authorization_code',
      redirect_uri: `${WEB_BASE_URL ?? ''}/login`
    })
  })
    .then(async res => await res.json())
    .then(auth => {
      if (auth.status != null) return error(ctx, undefined, auth.status, auth.message)
      const token = jwt.sign({ access_token: auth.access_token, refresh_token: auth.refresh_token }, JWT_KEY ?? 'r4nd0mk3y', { algorithm: 'HS256', expiresIn: JWT_EXPIRE })
      ctx.body = { token }
    }).catch(err => error(ctx, err, 403, 'Unauthorized to get access token'))
}

function getAuthState (clientId: string, scope: string): string {
  return Buffer.from(`${clientId}_${scope}`).toString('base64')
}
function validState (state: string, scope: string): boolean {
  if (state == null) return false
  return getAuthState(TWITCH_CLIENT_ID ?? '', scope) === state
}

export async function refreshToken (ctx: RouterContext): Promise<void> {
  return await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID ?? '',
      client_secret: TWITCH_CLIENT_SECRET ?? '',
      refresh_token: ctx.state.user.refresh_token,
      grant_type: 'refresh_token',
      redirect_uri: `${WEB_BASE_URL ?? ''}/login`
    })
  })
    .then(async res => await res.json())
    .then(auth => {
      if (auth.status != null) return error(ctx, undefined, auth.status, auth.message)
      const token = jwt.sign(
        { access_token: auth.access_token, refresh_token: auth.refresh_token },
        JWT_KEY ?? 'r4nd0mk3y',
        { algorithm: 'HS256', expiresIn: JWT_EXPIRE }
      )
      ctx.body = { token }
    }).catch(err => error(ctx, err, 403, 'Unauthorized to get access token'))
}
