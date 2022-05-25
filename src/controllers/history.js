import error from '../middlewares/error.js'
import UserModel from '../models/user.js'

export async function getHistory(req, res) {
    UserModel.findOne({ twitch_id: req.user.id }).then(async user => {
        res.send({
            history: user?.history,
            watch_later: user?.watch_later
        })
    }).catch(err => error(res, err, 400, "Cannot find history"))
}

export async function toggleHistory(req, res) {
    const enable = req.body.value === "true"
    UserModel.findOne({ twitch_id: req.user.id }).then(user => {
        if (!enable) user?.remove()
        else if (!user) user = UserModel.create({ twitch_id: req.user.id })
        res.send({ history: enable ? (user.history || []) : null })
    }).catch(err => error(res, err, 400, "Cannot toggle history"))
}

export async function setWatchtime(req, res) {
    if (req.query.vod == null || req.query.start == null) return error(res, "Bad Request", 400, "Queries [vod,start] cannot be null")
    if (isNaN(Number(req.query.vod)) || isNaN(Number(req.query.start))) return error(res, "Bad Request", 400, "Queries [vod,start] must be numbers")
    UserModel.findOne({ twitch_id: req.user.id }).then(async user => {
        if (user == null) throw new Error("User not found")
        let vod_index = user.history.findIndex(v => v.vod_id == req.query.vod)
        if (vod_index === -1) user.history.push({ vod_id: req.query.vod, start: req.query.start })
        else {
            if (isNaN(Number(req.query.start)) || Number(req.query.start) === 0) user.history.splice(vod_index, 1)
            else user.history[vod_index].start = Number(req.query.start)
        }
        await user.save()
        res.send()
    }).catch(err => error(res, err, 400, "Cannot update watchtime"))
}

export async function setWatchLater(req, res) {
    if (req.query.vod == null || req.query.add == null) return error(res, "Bad Request", 400, "Queries [vod,add] cannot be null")
    if (isNaN(Number(req.query.vod))) return error(res, "Bad Request", 400, "Query [vod] must be a number")
    UserModel.findOne({ twitch_id: req.user.id }).then(async user => {
        if (user == null) throw new Error("User not found")
        let vod_index = user.watch_later.indexOf(Number(req.query.vod))
        if (vod_index > -1) user.watch_later.splice(vod_index, 1)
        if (req.query.add === "true") user.watch_later.push(Number(req.query.vod))
        await user.save()
        res.send()
    }).catch(err => error(res, err, 400, "Cannot update watchtime"))
}