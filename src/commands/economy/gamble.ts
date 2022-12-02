import { Command } from "../../types.js";
import { moneyFormat, allMoneyFormat } from "../../util/formatting.js";
import { Currency, CurrencyID, getUser } from "../../util/util.js";

export default {
    name: "gamble",
    description: "Crippling gambling addiction",
    args: [
        { name: "money", type: "bigint", required: true },
        { name: "currency", type: "enum", enum: Currency, required: false },
    ],
    async run(msg, money: bigint, currency: CurrencyID = "points") {
        let u = await getUser(msg.author);
        if (!u.items["gambling_pass"]) return await msg.reply("You need a gambling pass in order to gamble")
        if (u.money[currency] < money) return await msg.reply("No money?");
        let n = Number((money * 10n) / u.money[currency]);

        let chance = 0.4 + (n / 10) / 12 + (Math.sin(Date.now()) / 7.5)
        u.money[currency] -= money
        if (Math.random() > chance) {
            if (n > 9) return await msg.reply("You lost all your money lmfao")
            else return await msg.reply(`You lost ${moneyFormat(money, currency)}. You now have ${allMoneyFormat(u.money)}`)
        }
        u.money[currency] += money * 2n
        await msg.reply(`You earned ${moneyFormat(money, currency)}! You now have ${allMoneyFormat(u.money)}`)
    },
} as Command;
