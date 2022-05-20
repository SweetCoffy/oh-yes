import { Message } from "discord.js";
import { getHotReloadable } from "../loader.js";

const prefix = ";"

export default [
    async function messageCreate(msg: Message) {
        try {
            //console.log(`${msg.author.username}: ${msg.content}`)
            if (msg.author.bot) return;
            if (msg.content.startsWith(prefix)) {
                var { parseCommand, convertArgs } = getHotReloadable().commands
                var d = parseCommand(msg.content.slice(prefix.length))
                if (!d) return msg.reply(`Bruh`)
                var { command: cmd, args } = d
                var converted = await convertArgs(args, cmd.args, msg.client)
                console.log(converted)
                await cmd.run(msg, ...converted)
            }
        } catch (err) {
            console.error(err)
        }
    }
]