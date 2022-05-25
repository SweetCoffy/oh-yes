import { getHotReloadable } from "../../loader.js";
import { Command } from "../../types.js";

export default {
    name: "alias-list",
    aliases: ["aliases", "alias-ls"],
    description: "Lists your local aliases",
    args: [],
    async run(msg) {
        var { getUser } = getHotReloadable().eco
        var u = await getUser(msg.author)
        await msg.reply({
            content: `User aliases:\n${Object.keys(u.aliases).map(el => `\`${el}\` -> \`${u.aliases[el]}\``).join(", ") || "None"}`
        })
    }
} as Command