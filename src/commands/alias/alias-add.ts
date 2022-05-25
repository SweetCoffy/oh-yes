import { commands, getHotReloadable, lookup } from "../../loader.js";
import { Command } from "../../types.js";

export default {
    name: "alias-add",
    aliases: ["add-alias", "addlias"],
    description: "Sets a local alias for a command",
    args: [{ type: "string", name: "name", required: true }, { type: "string", name: "target", required: true }],
    async run(msg, name: string, target: string) {
        if (!lookup.get(target)) return await msg.reply(`Unknown command: \`${target}\``)
        target = lookup.get(target) as string
        var { getUser } = getHotReloadable().eco
        var u = await getUser(msg.author)
        u.aliases[name] = target
        await msg.reply(`Set alias: \`${name}\` -> \`${target}\``)
    }
} as Command