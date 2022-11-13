import { getHotReloadable } from "../../loader.js";
import { Command } from "../../types";
import { allMoneyFormat, divideMoneyAll, getUser, itemString, multiplyMoney, rarities } from "../../util.js";

export default {
    name: "item-info",
    description: "b",
    args: [{ type: "string", name: "item", required: true }],
    async run(msg, item: string) {
        var { items } = getHotReloadable().eco
        var u = await getUser(msg.author);
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
                    },
                    {
                        name: "Attributes",
                        value: it.attributes.map(el => `${el.name} (Key \`${el.key}\`, Type ${el.type}, ${typeof el.value})`).join("\n") || "None",
                        inline: true,
                    },
                    ...it.attributes.map((attr) => ({ name: `${attr.name}`, value: attr.toString(true), inline: true }))
                ]
            }]
        })
    }
} as Command