import m3u8Router from './m3u8.js'
import twitchRouter from './twitch.js'
import historyRouter from './history.js'
import { setUserId, tokenRequired } from '../../middlewares/auth.js'
import { vodLimit, apiLimit, historyLimit } from '../../utils/rate-limit.js'
import { Router } from 'express'
const router = Router()

router.use("/m3u8", vodLimit, m3u8Router)
router.use("/twitch", apiLimit, tokenRequired, twitchRouter)
router.use("/history", historyLimit, tokenRequired, setUserId, historyRouter)

export default router