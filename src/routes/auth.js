import { Router } from 'express'
import { login, loginUrl, refreshToken } from '../controllers/auth.js'
import { tokenRequired } from '../middlewares/auth.js'
const router = Router()

router.get("/login", loginUrl)
router.post("/login", login)
router.post("/refresh_token", tokenRequired, refreshToken)

export default router