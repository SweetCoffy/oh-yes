import { getHotReloadable } from "../loader.js";
import { Command } from "../types.js";
import { addItem, getItem, itemString } from "../util.js";

export default {
    name: "item",
    aliases: ["items", "use", "inventory", "inv"],
    args: [{ type: "string", name: "item", required: false }, { type: "bigint", name: "amount", required: false }],
    async run(msg, item?: string, amount?: bigint) {
        var { getUser, items } = getHotReloadable().eco
        var u = await getUser(msg.author)
        if (!item) {
            var amounts = u.items
            await msg.reply({
                embeds: [
                    {
                        title: "Inventory",
                        description: Object.keys(amounts).map(k => `${itemString(k, amounts[k])} (\`${k}\`)`).join("\n")
                    }
                ]
            })
        } else {
            var info = items.get(item)
            if (!info) return await msg.reply(`That item doesn't exist`)
            if (!getItem(u, item)) return await msg.reply(`You don't have that item`)
            if (!info.onUse) return await msg.reply(`You can't use that item`)
            var amt = amount || 1n
            if (getItem(u, item) < amt) return await msg.reply(`You don't have enough of that item`)
            if (Math.random() < 0.99) addItem(u, item, -amt)
            var res = info.onUse(u, amt)
            if (res) {
                return await msg.reply(res[1])
            } else return await msg.reply(`Used ${itemString(item, amt)}`)
        }
    }
} as Command