import { RouterContext } from '@koa/router'
import error from '../middlewares/error.js'
import UserModel from '../models/user.js'

export async function getHistory (ctx: RouterContext): Promise<void> {
  return await UserModel.findOne({ twitch_id: ctx.state.user.id }).then(async user => {
    ctx.body = {
      history: user?.history,
      watch_later: user?.watch_later
    }
  }).catch(err => error(ctx, err, 400, 'Cannot find history'))
}

export async function toggleHistory (ctx: RouterContext): Promise<void> {
  const enable = ctx.request.body.value === 'true'
  return await UserModel.findOne({ twitch_id: ctx.state.user.id }).then(user => {
    if (enable == null) void user?.remove()
    else if (user == null) void UserModel.create({ twitch_id: ctx.state.user.id })
    const history = user?.history ?? []
    ctx.body = { history: enable ? history : null }
  }).catch(err => error(ctx, err, 400, 'Cannot toggle history'))
}

export async function setWatchtime (ctx: RouterContext): Promise<void> {
  if (ctx.query.vod == null || ctx.query.start == null) return error(ctx, 'Bad Request', 400, 'Queries [vod,start] cannot be null')
  if (isNaN(Number(ctx.query.vod)) || isNaN(Number(ctx.query.start))) return error(ctx, 'Bad Request', 400, 'Queries [vod,start] must be numbers')
  return await UserModel.findOne({ twitch_id: ctx.state.user.id }).then(async user => {
    if (user == null) throw new Error('User not found')
    const vodIndex = user.history.findIndex(v => Number(v.vod_id) === Number(ctx.query.vod))
    if (vodIndex === -1) user.history.push({ vod_id: Number(ctx.query.vod), start: Number(ctx.query.start) })
    else {
      if (isNaN(Number(ctx.query.start)) || Number(ctx.query.start) === 0) user.history.splice(vodIndex, 1)
      else user.history[vodIndex].start = Number(ctx.query.start)
    }
    await user.save()
  }).catch(err => error(ctx, err, 400, 'Cannot update watchtime'))
}

export async function setWatchLater (ctx: RouterContext): Promise<void> {
  if (ctx.query.vod == null || ctx.query.add == null) return error(ctx, 'Bad Request', 400, 'Queries [vod,add] cannot be null')
  if (isNaN(Number(ctx.query.vod))) return error(ctx, 'Bad Request', 400, 'Query [vod] must be a number')
  return await UserModel.findOne({ twitch_id: ctx.state.user.id }).then(async user => {
    if (user == null) throw new Error('User not found')
    const vodIndex = user.watch_later.indexOf(Number(ctx.query.vod))
    if (vodIndex > -1) user.watch_later.splice(vodIndex, 1)
    if (ctx.query.add === 'true') user.watch_later.push(Number(ctx.query.vod))
    await user.save()
  }).catch(err => error(ctx, err, 400, 'Cannot update watchtime'))
}
