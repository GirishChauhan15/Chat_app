import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import {rateLimit} from 'express-rate-limit'

const app = express()

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({limit:'16kb', extended:true}))
app.use(cookieParser())
// Cors with options
let whitelist = [process.env.CORS_ORIGIN, process.env.KEEPALIVE]

let corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials:true,
  methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))

// Request rate limit
app.use(rateLimit({
    limit:60,
    windowMs: 1 * 1000,
    legacyHeaders: false,
    standardHeaders: 'draft-8'
}))

// CSP (Content security policy)
app.use(function (req, res, next) {
    res.setHeader(
      'Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self'"
    );
    next();
  });


import userRouter from './router/user.router.js'
import messageRouter from './router/message.router.js'
import healthCheckRouter from './router/healthcheck.router.js'

app.use('/api/v1/user', userRouter)
app.use('/api/v1/message', messageRouter)
app.use('/api/v1/health', healthCheckRouter)

export default app