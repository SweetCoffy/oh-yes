import { Client, Intents } from "discord.js"
import { readFileSync } from "fs"
import { loadAll, loadEvents } from "./loader.js"

const client = new Client({ intents: Intents.FLAGS.GUILD_MESSAGES | Intents.FLAGS.GUILDS })

console.time("Loading stuff")
await loadAll(client)
console.timeEnd("Loading stuff")

console.time("Logging in")
await client.login(readFileSync(".token", "utf8"))
console.timeEnd("Logging in")

process.on("uncaughtException", (err, origin) => {
    console.log(err)
    console.log(origin)
})
process.on("unhandledRejection", (reason) => {
    console.log(reason)
})