import { Client, IntentsBitField } from "discord.js"
import { readFileSync } from "fs"
import { loadAll, loadEvents } from "./loader.js"

const client = new Client({
    intents: IntentsBitField.Flags.GuildMessages |
        IntentsBitField.Flags.MessageContent |
        IntentsBitField.Flags.Guilds |
        IntentsBitField.Flags.GuildMessageReactions,
})
const AutosaveInterval = 1000 * 32

console.time("Loading stuff")
await loadAll(client)
console.timeEnd("Loading stuff")

console.time("Logging in")
await client.login(readFileSync(".token", "utf8").trim())
console.timeEnd("Logging in")
process.on("uncaughtException", (err, origin) => {
    console.log(err)
    console.log(origin)
})
process.on("unhandledRejection", (reason) => {
    console.log(reason)
})
process.on("beforeExit", async () => {
    await eco.saveAllUsers()
})
setInterval(() => {
    eco.saveAllUsers()
}, AutosaveInterval)