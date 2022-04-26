import { getVODM3U8, getVODPlaylist, getVODTs, checkVod } from "../../controllers/m3u8.js"
import { Router } from 'express'
const router = Router()

router.get("/:vod/check", checkVod)
router.get("/:vod/playlist", getVODPlaylist)
router.get("/:vod/:ts", getVODTs)
router.get("/:vod", getVODM3U8)

export default router