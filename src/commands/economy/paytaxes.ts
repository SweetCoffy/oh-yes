import { Command } from "../../types.js";
import { moneyFormat } from "../../util/formatting.js";
import { eco } from "../../util/util.js";

export default {
    name: "paytaxes",
    description: "Pay your taxes.",
    async run(msg) {
        const { getUser } = eco()
        let u = await getUser(msg.author)
        if (u.taxes <= 0n) return await msg.reply(`You don't have any taxes to pay`)
        if (u.money.points < u.taxes) return await msg.reply(`No money?`)
        // Tax evasion
        let evasionChance = 0.01
        if (u.taxEvasion > 0) {
            evasionChance = 1
            u.taxEvasion--
        }
        if (Math.random() < evasionChance) {
            u.taxes = 0n
            return await msg.reply(`You committed tax evasion, very cool`)
        }
        let amount = u.taxes
        u.money.points -= u.taxes
        u.taxes = 0n
        await msg.reply(`You paid your taxes (${moneyFormat(amount, "points")})`)
    }
} as Command