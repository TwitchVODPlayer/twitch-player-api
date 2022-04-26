import { Router } from 'express'
import { getFollows, getUser, getVideos } from '../../controllers/twitch.js'
import { setUserId } from '../../middlewares/auth.js'
const router = Router()

router.get("/me", getUser)
router.get("/follows", setUserId, getFollows)
router.get("/videos/:user_id", getVideos)

export default router