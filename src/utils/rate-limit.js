import rateLimit from 'express-rate-limit'
import { formatError } from "./error.js"

const DEFAULT_OPTIONS = {
    standardHeaders: true,
    legacyHeaders: false,
    message: formatError({
        error: "Rate Limit",
        status: 429,
        message: "Too many requests"
    })
}

function setRateLimit(options) {
    return rateLimit({
        ...DEFAULT_OPTIONS,
        ...options
    })
}


export const defaultLimit = setRateLimit({
    windowMs: 60 * 1000,
    max: 100
})

export const apiLimit = setRateLimit({
    windowMs: 10 * 1000,
    max: 50
})

export const vodLimit = setRateLimit({
    windowMs: 10 * 1000,
    max: 100
})

export const historyLimit = setRateLimit({
    windowMs: 10 * 1000,
    max: 20
})