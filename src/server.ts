import Koa from 'koa'
import cors from '@koa/cors'
import apiRouter from './routes/api/index.js'
import authRouter from './routes/auth.js'
import helmet from 'koa-helmet'
import morgan from 'koa-morgan'
import mongoose from 'mongoose'
import koaBody from 'koa-body'

const app = new Koa()
app.use(helmet())
app.use(morgan('tiny'))
app.use(koaBody())
app.use(cors({
  origin: process.env.WEB_BASE_URL ?? '',
  credentials: true
}))

// database
mongoose.connect(process.env.DB_URI ?? '')
  .then(() => console.log('Connected to MongoDB'))
  .catch(console.error)

// default routes
app.use(async (ctx, next) => {
  await next()
  if (ctx.status === 404) ctx.body = { error: 'Not Found', status: 404, message: 'This API does not exist' }
})

// routes
app.use(authRouter.routes()).use(authRouter.allowedMethods())
app.use(apiRouter.routes()).use(apiRouter.allowedMethods())

// listen
const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`Listening at http://localhost:${port}`))
