import jwt from 'jsonwebtoken'
import error from '../middlewares/error.js'
const {
    WEB_BASE_URL,
    TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_SCOPE,
    JWT_KEY, JWT_EXPIRE
} = process.env

export function loginUrl(_, res) {
    res.send({ url: getLoginUrl() })
}

function getLoginUrl() {
    const url = new URL("https://id.twitch.tv/oauth2/authorize")
    url.search = new URLSearchParams({
        "response_type": "code",
        "client_id": TWITCH_CLIENT_ID,
        "redirect_uri": `${WEB_BASE_URL}/login`,
        "scope": TWITCH_SCOPE,
        "state": getAuthState(TWITCH_CLIENT_ID, TWITCH_SCOPE)
    }).toString()
    return url.toString()
}

export function login(req, res) {
    if (!validState(req.body.state, req.body.scope)) return error(res, "Invalid State", 403, "Invalid state value")
    fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
            "client_id": TWITCH_CLIENT_ID,
            "client_secret": TWITCH_CLIENT_SECRET,
            "code": req.body.code,
            "grant_type": "authorization_code",
            "redirect_uri": `${WEB_BASE_URL}/login`
        })
    }).then(res => res.json()).then(auth => {
        if (auth.status) return error(res, null, auth.status, auth.message)
        const token = jwt.sign({ access_token: auth.access_token, refresh_token: auth.refresh_token }, JWT_KEY, { algorithm: "HS256", expiresIn: JWT_EXPIRE })
        res.send({ token })
    }).catch(err => error(res, err, 403, "Unauthorized to get access token"))
}


function getAuthState(client_id, scope) {
    return Buffer.from(`${client_id}_${scope}`).toString("base64")
}
function validState(state, scope) {
    if (!state) return false
    return getAuthState(TWITCH_CLIENT_ID, scope) === state
}

export function refreshToken(req, res) {
    fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
            "client_id": TWITCH_CLIENT_ID,
            "client_secret": TWITCH_CLIENT_SECRET,
            "refresh_token": req.user.refresh_token,
            "grant_type": "refresh_token",
            "redirect_uri": `${WEB_BASE_URL}/login`
        })
    }).then(res => res.json()).then(auth => {
        if (auth.status) return error(res, null, auth.status, auth.message)
        const token = jwt.sign({ access_token: auth.access_token, refresh_token: auth.refresh_token }, JWT_KEY, { algorithm: "HS256", expiresIn: JWT_EXPIRE })
        res.send({ token })
    }).catch(err => error(res, err, 403, "Unauthorized to get access token"))
}