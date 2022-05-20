import { Message } from "discord.js";
import { getHotReloadable } from "../loader.js";

const prefix = ";"

export default [
    async function messageCreate(msg: Message) {
        try {
            //console.log(`${msg.author.username}: ${msg.content}`)
            if (msg.author.bot) return;
            if (msg.content.startsWith(prefix)) {
                var { parseCommand } = getHotReloadable().commands
                var d = parseCommand(msg.content.slice(prefix.length))
                if (!d) return msg.reply(`Bruh`)
                var { command: cmd, args } = d
                console.log(args)
                await cmd.run(msg, ...args)
            }
        } catch (err) {
            console.error(err)
        }
    }
]