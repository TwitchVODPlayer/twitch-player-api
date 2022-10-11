import { RouterContext } from '@koa/router'
import error from '../middlewares/error.js'

interface User {
  id?: string
  login?: string
  display_name?: string
  description?: string
  profile_image_url?: string
}

interface Video {
  id?: string
  title?: string
  duration?: number
  view_count?: number
  published_at?: string
  thumbnail_url?: string
}

const { TWITCH_CLIENT_ID, TWITCH_API_URL } = process.env
const MAX_PER_REQUEST = 100
const FOLLOWS_PER_REQUEST = 10
const VIDEOS_PER_REQUEST = 10

export async function fetchAPI (path: string, accessToken: string): Promise<any> {
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${accessToken}`)
  headers.append('Client-ID', TWITCH_CLIENT_ID ?? '')
  return await fetch(`${TWITCH_API_URL ?? ''}/${path}`, { headers })
    .then(async r => await r.json())
    .then(r => {
      if (r.status === 401) {
        const err = new Error('Invalid access token')
        err.cause = {
          statusText: 'Invalid Token',
          refctxh: true
        }
        throw err
      } else if (r.error != null) throw r
      return r
    })
}

export async function getUser (ctx: RouterContext): Promise<void> {
  const query = objectToQuery({
    login: ctx.params.login !== 'me' ? ctx.params.login : undefined
  })
  const data = await fetchAPI(`users${query}`, ctx.state.user.access_token).catch(err => error(ctx, err, 400, 'Failed to get infos'))
  ctx.body = formatUser(data.data.pop())
}

export async function getFollows (ctx: RouterContext): Promise<void> {
  const first = Number(ctx.query.first)
  let query = objectToQuery({
    from_id: ctx.state.user.id,
    after: ctx.query.next,
    first: Math.min((!isNaN(first) ? first : FOLLOWS_PER_REQUEST), MAX_PER_REQUEST)
  })
  let data = await fetchAPI(`users/follows${query}`, ctx.state.user.access_token).catch(err => error(ctx, err, 400, 'Failed to get follows'))
  query = objectToQuery(data.data.map((follow: any) => follow.to_id), 'id')
  const cursor = data.pagination.cursor
  data = await fetchAPI(`users${query}`, ctx.state.user.access_token).catch(err => { throw err })
  ctx.body = {
    follows: data.data.map((user: User) => formatUser(user)).sort((a: User, b: User) => String(a.login).localeCompare(String(b.login))),
    next: cursor
  }
}

export async function getUserVideos (ctx: RouterContext): Promise<void> {
  let query = objectToQuery({
    login: ctx.params.login
  })
  let data = await fetchAPI(`users${query}`, ctx.state.user.access_token).catch(err => { throw err })
  const first = Number(ctx.query.first)
  query = objectToQuery({
    user_id: data.data[0]?.id,
    sort: ctx.query.filter,
    after: ctx.query.next,
    first: Math.min((!isNaN(first) ? first : VIDEOS_PER_REQUEST), MAX_PER_REQUEST)
  })
  data = await fetchAPI(`videos${query}`, ctx.state.user.access_token).catch(err => error(ctx, err, 400, 'Failed to get user videos'))
  ctx.body = {
    videos: data.data.map((video: Video) => formatVideo(video)).filter((video: Video) => video.thumbnail_url),
    next: data.pagination.cursor
  }
}

export async function getVideos (ctx: RouterContext): Promise<void> {
  const query = objectToQuery(String(ctx.query.id)?.split(','), 'id')
  const data = await fetchAPI(`videos${query}`, ctx.state.user.access_token).catch(err => error(ctx, err, 400, 'Failed to get videos'))
  ctx.body = { videos: data.data.map((video: Video) => formatVideo(video)) }
}

function objectToQuery (obj: any = {}, k?: string, root = true): string {
  obj = JSON.parse(JSON.stringify(obj))
  if (Array.isArray(obj)) obj = obj.map(a => [k, a]) as any
  else obj = Object.entries(obj)
  if (obj == null || obj.length <= 0) return ''
  const r = obj.reduce((t: string, o: [string, any]) => {
    const [k, v] = o
    let s = t
    if (Array.isArray(v)) s += objectToQuery(v, k, false)
    else if (typeof v === 'object') s += objectToQuery(v, undefined, false)
    else s += `${k}=${String(v)}&`
    return s
  }, root ? '?' : '')
  return root ? r.replace(/&$/, '') : r
}

function formatUser (data: User): User {
  if (data == null) return {}
  return {
    id: data.id,
    login: data.login,
    display_name: data.display_name,
    description: data.description,
    profile_image_url: data.profile_image_url
  }
}

function formatVideo (data: Video): Video {
  if (data == null) return {}
  return {
    id: data.id,
    title: data.title,
    duration: data.duration,
    view_count: data.view_count,
    published_at: data.published_at,
    thumbnail_url: data.thumbnail_url
  }
}
