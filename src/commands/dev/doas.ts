import { User } from "discord.js";
import { getHotReloadable } from "../../loader.js";
import { Command } from "../../types.js";

export default {
    name: "doas",
    devOnly: true,
    description: "Runs a command as another user",
    args: [{ type: "user", name: "user", required: true }, { type: "string", name: "...command", required: true }],
    lexer: false,
    async run(msg, user: User, command: string[]) {
        let { parseCommand, convertArgs, CommandResponse } = getHotReloadable().commands
        let fakemsg = Object.create(msg)
        fakemsg.author = user
        let str = command.join(" ")
        let d = parseCommand(str)
        if (!d) return await msg.reply("Bruh")
        let { command: cmd, args } = d
        let converted = await convertArgs(args, cmd.args, msg.client)
        let res = await cmd.run(fakemsg, ...converted)
        if (res instanceof CommandResponse) {
            if (res.isSendable) res.send(fakemsg)
        }
    }
} as Command