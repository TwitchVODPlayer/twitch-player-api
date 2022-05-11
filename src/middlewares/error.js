import { formatError } from "../utils/error.js"

export default function error(res, err = "Error", status = 500, msg = "Unknown error") {
    if (err === null) err = "Error"
    
    if (process.env.NODE_ENV === "development") {
        if (err instanceof Error) console.error(err)
        else console.error(`Error: ${err} - ${msg}`)
    }

    if (typeof err === "string") {
        const statusText = err
        err = new Error(msg)
        err.statusText = statusText
    }

    return res.status(status).send(formatError({
        error: err.statusText || "Error",
        status: status,
        message: msg,
        needRefresh: err.needRefresh || undefined
    }))
}