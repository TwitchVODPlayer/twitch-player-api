import Router from '@koa/router'
import { getHistory, toggleHistory, setWatchtime, setWatchLater } from '../../controllers/history.js'
import { tokenRequired } from '../../middlewares/auth.js'
import { historyLimit } from '../../utils/rate-limit.js'

const router = new Router({
  prefix: '/history'
})

router.use(historyLimit)
router.use(tokenRequired)
router.get('/', getHistory)
router.post('/toggle', toggleHistory)
router.put('/watchtime', setWatchtime)
router.put('/watchlater', setWatchLater)

export default router
