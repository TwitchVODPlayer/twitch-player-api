import m3u8Router from './m3u8.js'
import twitchRouter from './twitch.js'
import { tokenRequired } from '../../middlewares/auth.js'
import { vodLimit, apiLimit } from '../../utils/rate-limit.js'
import { Router } from 'express'
const router = Router()

router.use("/m3u8", vodLimit, m3u8Router)
router.use("/twitch", apiLimit, tokenRequired, twitchRouter)

export default router