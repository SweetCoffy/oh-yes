import { Command } from "../types";

export default {
    name: "ping",
    aliases: ["pong"],
    description: "Ping",
    args: [],
    async run(msg) {
        var start = Date.now()
        var m = await msg.reply("a")
        var time = Date.now() - start
        await m.edit(`Pong: ${time}ms`)
    }
} as Command