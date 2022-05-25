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
        var { parseCommand, convertArgs } = getHotReloadable().commands
        var fakemsg = Object.create(msg)
        fakemsg.author = user
        var str = command.join(" ")
        var d = parseCommand(str)
        if (!d) return await msg.reply("Bruh")
        var { command: cmd, args } = d
        var converted = await convertArgs(args, cmd.args, msg.client)
        await cmd.run(fakemsg, ...converted)
    }
} as Command