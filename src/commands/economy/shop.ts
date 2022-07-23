import { getHotReloadable } from "../../loader.js";
import { Command } from "../../types.js";
import { addItem, allMoneyFormat, eco, hasMoney, itemString, moneyLeft, multiplyMoney, subtractMoney } from "../../util.js";

export default {
    name: "shop",
    aliases: ["buy"],
    description: "Buys an item or shows a list of items if no arguments passed",
    args: [{
        name: "item", type: "string",
        required: false
    }, {
        name: "amount",
        type: "bigint",
        required: false,
    }],
    async run(msg, item?: string, amount?: bigint) {
        var { items, getUser, getPrice, itemAvailable } = getHotReloadable().eco
        var u = await getUser(msg.author)
        if (!item) {
            await msg.reply({
                embeds: [{
                    title: "Shop",
                    description: items.filter((v, k) => !v.unlisted && itemAvailable(k, u)).map((v, k) => `${itemString(k)} (\`${k}\`) ${allMoneyFormat(getPrice(k, u, 1n))}`).join("\n")
                }]
            })
        } else {
            var info = items.get(item)
            if (!info) return await msg.reply("what")
            if (info.unlisted || !itemAvailable(item, u)) return await msg.reply(`You cannot buy this item`)
            if (info.unique && u.items[item]) return await msg.reply(`You can only have one of this item`)
            var amt = amount || 0n
            if (info.unique && amt > 1n) return await msg.reply(`You can't buy more than one of this item`)
            var total = getPrice(item, u, amt)
            if (hasMoney(moneyLeft(u.money, total))) {
                subtractMoney(u.money, total)
                addItem(u, item, amt)
                await msg.reply(`Bought ${itemString(item, amt)} for ${allMoneyFormat(total)}`)
            } else {
                return await msg.reply(`Not enough money`)
            }
        }
    }
} as Command