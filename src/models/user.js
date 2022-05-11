import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    __v: false,
    twitch_id: {
        type: Number,
        required: true,
        unique: true
    },
    history: [{
        _id: false,
        vod_id: Number,
        start: Number,
    }],
    watch_later: [{
        _id: false,
        type: Number
    }]
})

export default mongoose.model('user', UserSchema);