import error from '../middlewares/error.js'
import UserModel from '../models/user.js'

export async function getHistory(req, res) {
    UserModel.findOne({ twitch_id: req.user.id }).then(async user => {
        res.send({ history: user?.history })
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
        let vod = user.history.find(v => v.vod_id == req.query.vod)
        if (vod == null) user.history.push({ vod_id: req.query.vod, start: req.query.start })
        else vod.start = Number(req.query.start)
        await user.save()
        res.send()
    }).catch(err => error(res, err, 400, "Cannot update watchtime"))
}