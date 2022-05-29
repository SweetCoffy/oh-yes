import { getHotReloadable } from "../../loader.js";
import { Command } from "../../types";
import { itemString } from "../../util.js";

export default {
    name: "item-info",
    description: "b",
    args: [{ type: "string", name: "item", required: true }],
    async run(msg, item: string) {
        var { items } = getHotReloadable().eco
        var it = items.get(item)
        if (!it) return await msg.reply("No.")
        await msg.reply({
            embeds: [{
                title: itemString(item, undefined),
                description: `${it.description || "N/A"}`,
            }]
        })
    }
} as Command