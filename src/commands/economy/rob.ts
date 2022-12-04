import { User } from "discord.js";
import { getHotReloadable } from "../../loader.js";
import { Command } from "../../types.js";
import { moneyFormat, percent } from "../../util/formatting.js";
import { min } from "../../util/math/bigint.js";
import { Currency, CurrencyID, getUser } from "../../util/util.js";
const { CommandResponse } = cmd

export default {
    name: "rob",
    aliases: ["steal"],
    cooldown: 30 * 1000,
    description: "Tries to rob `victim`.",
    args: [{ type: "user", name: "victim" }, { type: "enum", name: "currency", enum: Currency }],
    async run(msg, victim: User, currency: CurrencyID = "points") {
        const baseChance = 0.3
        let u = await getUser(msg.author)
        let target = await getUser(victim)
        function calcBonus(a: bigint, b: bigint) {
            return Number((b * 25n) / a) / 100
        }
        // Robbing from more wealthy users is encouraged by increasing success rate.
        // Robbing from less wealthy users is discouraged.
        let bonus = calcBonus(u.money[currency], target.money[currency])
        let chance = baseChance * (1 + Math.log2(bonus))
        if (chance <= 0) {
            return CommandResponse.error({ message: "Don't even try." })
        }
        let amount = min(u.money[currency] / 2n, target.money[currency] / 4n)
        if (Math.random() > chance) {
            let lost = min(amount / 2n, u.money[currency] / 2n)
            u.money[currency] -= lost
            return CommandResponse.error({ message: `You got caught and were charged ${moneyFormat(lost, currency)}. (${percent(chance)} success rate)` })
        }
        u.money[currency] += amount
        target.money[currency] -= amount
        return CommandResponse.success({ message: `Successfully stole ${moneyFormat(amount, currency)}. (${percent(chance)}) success rate` })
    },
} as Command