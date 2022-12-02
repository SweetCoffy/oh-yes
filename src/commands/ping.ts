import { Command } from "../types.js";

export default {
    name: "ping",
    aliases: ["pong"],
    description: "Shows the bot's latency",
    args: [{ type: "string", name: "...args", required: true }],
    async run(msg) {
        let start = Date.now()
        let m = await msg.reply("a")
        let time = Date.now() - start
        await m.edit(`Pong: ${time}ms`)
    }
} as Command