import { Router } from 'express'
import { getFollows, getUser, getVideos, getUserVideos } from '../../controllers/twitch.js'
import { setUserId } from '../../middlewares/auth.js'
const router = Router()

router.get("/users/:login", getUser)
router.get("/users", getUser)
router.get("/follows", setUserId, getFollows)
router.get("/videos/:login", getUserVideos)
router.get("/videos", getVideos)

export default router