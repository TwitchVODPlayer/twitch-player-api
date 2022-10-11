import Router from '@koa/router'
import m3u8Router from './m3u8.js'
import twitchRouter from './twitch.js'
import historyRouter from './history.js'

const router = new Router({
  prefix: '/api'
})

router.use(m3u8Router.routes(), m3u8Router.allowedMethods())
router.use(twitchRouter.routes(), twitchRouter.allowedMethods())
router.use(historyRouter.routes(), historyRouter.allowedMethods())

export default router
