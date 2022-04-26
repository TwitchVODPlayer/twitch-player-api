import express from "express"
import cors from 'cors'
import apiRouter from './routes/api/index.js'
import authRouter from './routes/auth.js'
import helmet from 'helmet'
import { defaultLimit, apiLimit } from './utils/rate-limit.js'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(cors({
    origin: process.env.WEB_BASE_URL,
    credentials: true
}))

app.use("/auth", apiLimit, authRouter)
app.use("/api", apiRouter)
app.get("*", defaultLimit, (_, res) => res.status(404).send({ error: "Not Found", status: 404, message: "This API does not exist" }))

const port = process.env.PORT || 3000
app.listen(port, () => console.info(`Listening at http://localhost:${port}`))