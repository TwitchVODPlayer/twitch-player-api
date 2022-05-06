import jwt from 'jsonwebtoken'
import { fetchAPI } from '../controllers/twitch.js'
import error from './error.js'

export function tokenRequired(req, res, next) {
    const auth = req.headers.authorization?.split(' ')[1]
    if (!auth) return error(res, "Missing Token", 401, "Missing bearer token")

    jwt.verify(auth, process.env.JWT_KEY, (err, tokens) => {
        if (err) return error(res, err, 401, "Invalid token")
        if (!tokens) return error(res, null, 401, "Token is empty or null")
        
        req.user = tokens
        next()
    })
}

export function setUserId(req, res, next) {
    if (!req.user?.access_token) return error(res, "Missing Token", 401, "Missing access token")

    fetchAPI('users', req.user.access_token).then(data => {
        req.user.id = data.data[0].id
        next()
    }).catch(err => error(res, err, 400, "Could not get user id"))
}