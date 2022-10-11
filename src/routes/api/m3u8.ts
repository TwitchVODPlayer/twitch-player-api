import Router from '@koa/router'
import { getVODM3U8, getVODPlaylist, getVODTs, checkVod } from '../../controllers/m3u8.js'
import { vodLimit } from '../../utils/rate-limit.js'

const router = new Router({
  prefix: '/m3u8'
})

router.use(vodLimit)
router.get('/:vod/check', checkVod)
router.get('/:vod/playlist', getVODPlaylist)
router.get('/:vod/:ts', getVODTs)
router.get('/:vod', getVODM3U8)

export default router
