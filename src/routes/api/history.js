import { Router } from 'express'
import { getUserVideos, toggleHistory, setWatchtime, setWatchLater } from '../../controllers/history.js'
const router = Router()

router.get("/", getUserVideos)
router.post("/toggle", toggleHistory)
router.put("/watchtime", setWatchtime)
router.put("/watchlater", setWatchLater)

export default router