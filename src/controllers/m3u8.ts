import { RouterContext } from '@koa/router'
import twitch from 'm3u8-twitch-vod'
import error from '../middlewares/error.js'
const { API_BASE_URL } = process.env

export async function getVODPlaylist (ctx: RouterContext): Promise<void> {
  if (ctx.params.vod == null) return error(ctx, 'Bad Request', 400, 'Param [vod] cannot be null')
  const vodId = Number(ctx.params.vod)
  return await twitch.getM3u8(vodId).then(m3u8 => {
    ctx.body = parseM3u8(m3u8, `${API_BASE_URL ?? ''}/m3u8/${vodId}/`)
  }).catch(err => error(ctx, err, 404, 'VOD not found'))
}

export async function getVODTs (ctx: RouterContext): Promise<void> {
  if (ctx.params.vod == null || ctx.params.ts == null || ctx.query.url == null) return error(ctx, 'Bad Request', 400, 'Param [vod,ts] and query [url] cannot be null')
  return await twitch.getAccessToken(Number(ctx.params.vod)).then(async accessToken => {
    return await twitch.getTsBuffer(`${String(ctx.query.url)}${ctx.params.ts}`, accessToken).then(ts => {
      ctx.body = Buffer.from(ts)
    }).catch(err => error(ctx, err, 400, 'Failed to fetch ts file'))
  }).catch(err => error(ctx, err, 404, 'VOD not found'))
}

export async function getVODM3U8 (ctx: RouterContext): Promise<void> {
  if (ctx.params.vod == null) return error(ctx, 'Bad Request', 400, 'Param [vod] and query [url] cannot be null')
  const vodId = Number(ctx.params.vod)
  return await twitch.getAccessToken(vodId).then(async accessToken => {
    return await twitch.getM3u8Content(`${String(ctx.query.url)}index-dvr.m3u8`, accessToken).then(async m3u8 => {
      if (m3u8.includes('AccessDenied')) m3u8 = await twitch.getM3u8Content(`${String(ctx.query.url)}highlight-${ctx.params.vod}.m3u8`, accessToken)
      ctx.body = parseTs(m3u8, `${API_BASE_URL ?? ''}/m3u8/${vodId}/`, String(ctx.query.url))
    }).catch(err => { throw err })
  }).catch(err => error(ctx, err, 400, 'VOD not found'))
}

export async function checkVod (ctx: RouterContext): Promise<void> {
  return await twitch.getM3u8(Number(ctx.params.vod)).then(() => {
    ctx.body = { vod_id: ctx.params.vod }
  }).catch(err => {
    error(ctx, err, 404, 'Unknown VOD id')
  })
}

function parseM3u8 (content: string, baseUrl: string): string {
  if (content == null || baseUrl == null) return content
  return content.replace(/(http(.+)\/)(index-dvr|highlight-(\d+))\.m3u8/g, `${baseUrl}?url=$1`)
}

function parseTs (content: string, baseUrl: string, url: string): string {
  if (content == null || baseUrl == null) return content
  return content.replace(/\n(.*)\.ts/gi, `\n${baseUrl.replace(/(\/)*$/, '/')}$1.ts?url=${url}`)
}
