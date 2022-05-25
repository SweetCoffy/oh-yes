import { getHotReloadable } from "../loader.js";
import { Command } from "../types.js";
import { addItem, allMoneyFormat, hasMoney, itemString, moneyLeft, multiplyMoney, subtractMoney } from "../util.js";

export default {
    name: "shop",
    aliases: ["buy"],
    description: "Buys an item or, if no arguments are passed, shows a list of buyable items",
    args: [{
        name: "item", type: "string",
        required: false
    }, {
        name: "amount",
        type: "bigint",
        required: false,
    }],
    async run(msg, item?: string, amount?: bigint) {
        var { items, getUser } = getHotReloadable().eco
        var u = await getUser(msg.author)
        if (!item) {
            await msg.reply({
                embeds: [{
                    title: "Shop",
                    description: items.map((v, k) => `${itemString(k)} (\`${k}\`) ${allMoneyFormat(v.price)}`).join("\n")
                }]
            })
        } else {
            var info = items.get(item)
            if (!info) return await msg.reply("what")
            var amt = amount || 0n
            var total = multiplyMoney(info.price, amt)
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