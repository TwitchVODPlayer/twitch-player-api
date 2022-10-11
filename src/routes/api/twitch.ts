import Router from '@koa/router'
import { getFollows, getUser, getVideos, getUserVideos } from '../../controllers/twitch.js'
import { setUserId, tokenRequired } from '../../middlewares/auth.js'
import { apiLimit } from '../../utils/rate-limit.js'

const router = new Router({
  prefix: '/twitch'
})

router.use(apiLimit)
router.use(tokenRequired)
router.get('/users/:login', getUser)
router.get('/users', getUser)
router.get('/follows', setUserId, getFollows)
router.get('/videos/:login', getUserVideos)
router.get('/videos', getVideos)

export default router
