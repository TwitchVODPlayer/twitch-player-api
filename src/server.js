import express from "express"
import cors from 'cors'
import apiRouter from './routes/api/index.js'
import authRouter from './routes/auth.js'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'
import { defaultLimit, apiLimit } from './utils/rate-limit.js'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(morgan('tiny'))
app.use(cors({
    origin: [process.env.WWW_WEB_BASE_URL, process.env.WEB_BASE_URL],
    credentials: true
}))

// database
mongoose.connect(process.env.DB_URI).then(() => {
    console.info("Connected to MongoDB")
}).catch(console.error)

// routes
app.use("/auth", apiLimit, authRouter)
app.use("/api", apiRouter)
app.get("*", defaultLimit, (_, res) => res.status(404).send({ error: "Not Found", status: 404, message: "This API does not exist" }))

// listen
const port = process.env.PORT || 3000
app.listen(port, '127.0.0.1', () => console.info(`Listening at http://localhost:${port}`))