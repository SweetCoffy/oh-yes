import { getHotReloadable } from "../loader.js";
import { Command } from "../types.js";

export default {
    name: "alias-remove",
    aliases: ["alias-delete", "alias-rm", "delete-alias", "remove-alias", "rm-alias"],
    description: "Removes a local alias",
    args: [{ type: "string", name: "name", required: true }],
    async run(msg, name: string) {
        var { getUser } = getHotReloadable().eco
        var u = await getUser(msg.author)
        if (delete u.aliases[name]) await msg.reply(`Removed alias \`${name}\``)
        else await msg.reply(`Alias \`${name}\` doesn't exist`)
    }
} as Command