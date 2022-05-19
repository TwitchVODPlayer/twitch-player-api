import twitch from 'm3u8-twitch-vod'
import error from '../middlewares/error.js'
const { API_BASE_URL } = process.env

export function getVODPlaylist(req, res) {
    if (req.params.vod == null) return error(res, "Bad Request", 400, "Param [vod] cannot be null")
    const vod_id = Number(req.params.vod)
    twitch.getM3u8(vod_id).then(m3u8 => {
        res.send(parseM3u8(m3u8, `${API_BASE_URL}/m3u8/${vod_id}/`))
    }).catch(err => error(res, err, 404, "VOD not found"))
}

export function getVODTs(req, res) {
    if (req.params.vod == null || req.params.ts == null || req.query.url == null) return error(res, "Bad Request", 400, "Param [vod,ts] and query [url] cannot be null")
    twitch.getAccessToken(req.params.vod).then(access_token => {
        twitch.getTsBuffer(`${req.query.url}${req.params.ts}`, access_token).then(ts => {
            res.contentType("arraybuffer").send(Buffer.from(ts, 'binary'))
        }).catch(err => error(res, err, 400, "Failed to fetch ts file"))
    }).catch(err => error(res, err, 404, "VOD not found"))
}

export function getVODM3U8(req, res) {
    if (req.params.vod == null) return error(res, "Bad Request", 400, "Param [vod] and query [url] cannot be null")
    const vod_id = Number(req.params.vod)
    twitch.getAccessToken(vod_id).then(access_token => {
        twitch.getM3u8Content(`${req.query.url}index-dvr.m3u8`, access_token).then(async m3u8 => {
            if (m3u8.indexOf('AccessDenied') > -1) m3u8 = await twitch.getM3u8Content(`${req.query.url}highlight-${req.params.vod}.m3u8`, access_token)
            res.send(parseTs(m3u8, `${API_BASE_URL}/m3u8/${vod_id}/`, req.query.url))
        })
    }).catch(err => error(res, err, 400, "VOD not found"))
}

export async function checkVod(req, res) {
    twitch.getM3u8(req.params.vod).then(() => {
        res.send({ vod_id: req.params.vod })
    }).catch(err => error(res, err, 404, `Unknown VOD id`))
}


function parseM3u8(content, base_url) {
    if (!content || !base_url) return content
    return content.replace(/(http(.+)\/)(index-dvr|highlight-(\d+))\.m3u8/g, `${base_url}?url=$1`)
}

function parseTs(content, base_url, url) {
    if (!content || !base_url) return content
    return content.replace(/\n(.*)\.ts/gi, `\n${base_url.replace(/(\/)*$/, '/')}$1.ts?url=${url}`)
}