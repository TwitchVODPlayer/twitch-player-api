import error from '../middlewares/error.js'
const { TWITCH_CLIENT_ID, TWITCH_API_URL } = process.env

export async function fetchAPI(path, access_token) {
    return fetch(`${TWITCH_API_URL}/${path}`, {
        headers: {
            "Authorization": `Bearer ${access_token}`,
            'Client-ID': TWITCH_CLIENT_ID
        }
    }).then(r => r.json()).then(r => {
        if (r.status === 401) {
            const err = new Error("Invalid access token")
            err.statusText = "Invalid Token"
            err.needRefresh = true
            throw err
        }
        return r
    }).then(r => r.data)
}

export function getUser(req, res) {
    fetchAPI('users', req.user.access_token).then(([user]) => {
        res.send(user)
    }).catch(err => error(res, err, 401, "Failed to get infos"))
}

export function getFollows(req, res) {
    fetchAPI(`users/follows?from_id=${req.user.id}`, req.user.access_token).then(follows => {
        res.send(follows)
    }).catch(err => error(res, err, 401, "Failed to get follows"))
}

export function getVideos(req, res) {
    fetchAPI(`videos?user_id=${req.params.user_id}`, req.user.access_token).then(follows => {
        res.send(follows)
    }).catch(err => error(res, err, 401, `Failed to get videos of user with id '${req.params.id}'`))
}