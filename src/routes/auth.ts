import Router from '@koa/router'
import { login, loginUrl, refreshToken } from '../controllers/auth.js'
import { tokenRequired } from '../middlewares/auth.js'
import { apiLimit } from '../utils/rate-limit.js'

const router = new Router({
  prefix: '/auth'
})

router.get('/login', apiLimit, loginUrl)
router.post('/login', apiLimit, login)
router.post('/refresh_token', apiLimit, tokenRequired, refreshToken)

export default router
