import { Item } from "../../gen-items.js";
import { getHotReloadable } from "../../loader.js";
import { ArgType, Command } from "../../types.js";
import { addItem, getItem, itemString } from "../../util.js";

export default {
    name: "item",
    aliases: ["items", "use", "inventory", "inv"],
    description: "Uses an item. If no arguments are passed, lists your items instead",
    args: [{ type: ArgType.ItemType, name: "item", required: false }, { type: "bigint", name: "amount", required: false }],
    async run(msg, item?: Item, amount?: bigint) {
        let { getUser, items } = getHotReloadable().eco
        let u = await getUser(msg.author)
        if (!item) {
            let amounts = u.items
            await msg.reply({
                embeds: [
                    {
                        title: "Inventory",
                        description: Object.keys(amounts).map(k => `${itemString(k, amounts[k])} (\`${k}\`)`).join("\n")
                    }
                ]
            })
        } else {
            let info = items.get(item)
            if (!info) return await msg.reply(`That item doesn't exist`)
            if (!u.has(item)) return await msg.reply(`You don't have that item`)
            if (!info.onUse) return await msg.reply(`You can't use that item`)
            let amt = amount || 1n
            if (u.get(item) < amt) return await msg.reply(`You don't have enough of that item`)
            let res = info.onUse(u, amt, info)
            if (typeof res?.[0] == "bigint") amt = res[0];
            if (Math.random() < 0.99) u.add(item, -amt)
            if (typeof res?.[1] == "string") {
                return await msg.reply(res[1])
            } else return await msg.reply(`Used ${itemString(item, amt)}`)
        }
    }
} as Command