import { getHotReloadable } from "../../loader.js";
import { Command } from "../../types";
import { allMoneyFormat, itemString, rarities } from "../../util.js";

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
                color: rarities[it.rarity].color,
                description: `${it.description || "N/A"}`,
                fields: [
                    {
                        name: "Price",
                        value: allMoneyFormat(it.price) || "N/A",
                        inline: true,
                    },
                    {
                        name: "Rarity",
                        value: rarities[it.rarity].name,
                        inline: true,
                    }
                ]
            }]
        })
    }
} as Command