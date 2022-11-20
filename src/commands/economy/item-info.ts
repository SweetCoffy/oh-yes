import { Item } from "../../gen-items.js";
import { getHotReloadable } from "../../loader.js";
import { ArgType, Command } from "../../types.js";
import { allMoneyFormat, divideMoneyAll, getUser, itemString, multiplyMoney, rarities } from "../../util.js";

export default {
    name: "item-info",
    description: "b",
    args: [{ type: ArgType.ItemType, name: "item", required: true }],
    async run(msg, item: Item) {
        let { items, ItemAttributeType } = getHotReloadable().eco
        let u = await getUser(msg.author);
        let it = items.get(item)
        if (!it) return await msg.reply("No.")
        await msg.reply({
            embeds: [{
                title: itemString(item, undefined),
                color: rarities[it.rarity].color,
                description: `${`${it.lore ? "*'" + it.lore + "'*\n" : ""}${it.description}` || "N/A"}`,
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
                        value: it.attributes.map(el => `${el.name} (Key \`${el.key}\`, Type ${ItemAttributeType[el.type]}, ${typeof el.value})`).join("\n") || "None",
                        inline: true,
                    },
                    ...it.attributes.map((attr) => ({ name: `${attr.name}`, value: attr.toString(true), inline: true }))
                ]
            }]
        })
    }
} as Command