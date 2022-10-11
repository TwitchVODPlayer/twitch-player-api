import { Schema, model } from 'mongoose'

interface User {
  twitch_id: number
  history: Array<{
    vod_id: number
    start: number
  }>
  watch_later: number[]
}

const UserSchema = new Schema<User>({
  twitch_id: {
    type: Number,
    required: true,
    unique: true
  },
  history: [{
    _id: false,
    vod_id: Number,
    start: Number
  }],
  watch_later: [{
    _id: false,
    type: Number
  }]
}, { versionKey: false })

export default model('user', UserSchema)
