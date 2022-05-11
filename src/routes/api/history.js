import { Router } from 'express'
import { getHistory, setWatchtime, toggleHistory } from '../../controllers/history.js'
const router = Router()

router.get("/", getHistory)
router.post("/toggle", toggleHistory)
router.put("/watchtime", setWatchtime)

export default router