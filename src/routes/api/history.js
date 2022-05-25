import { Router } from 'express'
import { getHistory, toggleHistory, setWatchtime, setWatchLater } from '../../controllers/history.js'
const router = Router()

router.get("/", getHistory)
router.post("/toggle", toggleHistory)
router.put("/watchtime", setWatchtime)
router.put("/watchlater", setWatchLater)

export default router