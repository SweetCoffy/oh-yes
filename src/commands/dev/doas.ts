import { User } from "discord.js";
import { getHotReloadable } from "../../loader.js";
import { Command } from "../../types.js";

export default {
    name: "doas",
    devOnly: true,
    description: "Runs a command as another user",
    args: [{ type: "user", name: "user", required: true }, { type: "string", name: "...command", required: true }],
    lexer: false,
    async run(msg, user: User, commandName: string[]) {
        let { parseCommand, convertArgs, CommandResponse } = cmd
        let fakemsg = Object.create(msg)
        fakemsg.author = user
        let str = commandName.join(" ")
        let d = parseCommand(str)
        if (!d) return CommandResponse.error({ message: `Invalid command or arguments.` })
        let { command, args } = d
        let converted = await convertArgs(args, command.args, msg.client)
        let res = await command.run(fakemsg, ...converted)
        if (res instanceof CommandResponse) {
            if (res.isSendable) res.send(fakemsg)
        }
    }
} as Command