import error from '../middlewares/error.js'
const { TWITCH_CLIENT_ID, TWITCH_API_URL } = process.env
const MAX_PER_REQUEST = 100
const FOLLOWS_PER_REQUEST = 10
const VIDEOS_PER_REQUEST = 10

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
        } else if (r.error) throw r
        return r
    })
}

export function getUser(req, res) {
    let query = objectToQuery({
        login: req.params.login !== "me" ? req.params.login : undefined
    })
    fetchAPI(`users${query}`, req.user.access_token).then(data => {
        res.send(formatUser(data.data.pop()))
    }).catch(err => error(res, err, 400, "Failed to get infos"))
}

export function getFollows(req, res) {
    let query = objectToQuery({
        from_id: req.user.id,
        after: req.query.next,
        first: Math.min((Number(req.query.first) || FOLLOWS_PER_REQUEST), MAX_PER_REQUEST)
    })
    fetchAPI(`users/follows${query}`, req.user.access_token).then(data => {
        query = objectToQuery(data.data.map(follow => follow.to_id), "id")
        const cursor = data.pagination.cursor
        fetchAPI(`users${query}`, req.user.access_token).then(data => {
            res.send({
                follows: data.data.map(user => formatUser(user)).sort((a, b) => String(a.login).localeCompare(String(b.login))),
                next: cursor
            })
        })
    }).catch(err => error(res, err, 400, "Failed to get follows"))
}

export function getVideos(req, res) {
    let query = objectToQuery({
        login: req.params.login
    })
    fetchAPI(`users${query}`, req.user.access_token).then(data => {
        let query = objectToQuery({
            user_id: data.data[0]?.id,
            sort: req.query.filter,
            after: req.query.next,
            first: Math.min((Number(req.query.first) || VIDEOS_PER_REQUEST), MAX_PER_REQUEST)
        })
        fetchAPI(`videos${query}`, req.user.access_token).then(data => {
            res.send({
                videos: data.data.map(video => formatVideo(video)),
                next: data.pagination.cursor
            })
        })
    }).catch(err => error(res, err, 400, "Failed to get videos"))
}

function objectToQuery(o = {}, k, root = true) {
    o = JSON.parse(JSON.stringify(o))
    if (Array.isArray(o)) o = o.map(a => [k,a])
    else o = Object.entries(o)
    if (!o?.length) return ''
    const r = o.reduce((t, [k,v]) => {
        let s = t
        if (Array.isArray(v)) s += objectToQuery(v, k, false)
        else if (typeof v === "object") s += objectToQuery(v, null, false)
        else s += `${k}=${v}&`
        return s
    }, root ? '?' : '')
    return root ? r.replace(/&$/, '') : r
}

function formatUser(data) {
    if (!data) return {}
    return {
        id: data.id,
        login: data.login,
        display_name: data.display_name,
        description: data.description,
        profile_image_url: data.profile_image_url
    }
}
function formatVideo(data) {
    if (!data) return {}
    return {
        id: data.id,
        title: data.title,
        duration: data.duration,
        view_count: data.view_count,
        published_at: data.published_at,
        thumbnail_url: data.thumbnail_url
    }
}