import { EmbedBuilder, User } from "discord.js";
import { Command } from "../../types";
import { CurrencyID, format, getUser, moneyFormat, WrappedUserData } from "../../util.js";

export default {
    name: "compare",
    description: "Compares two users' wealth",
    args: [{ name: "a", type: "user" }, { name: "b", type: "user" }],
    async run(msg, a: User, b?: User) {
        if (!b) {
            b = a
            a = msg.author
        }
        function comparePercent(a: bigint, b: bigint) {
            if (a == 0n && b == 0n) return `N/A`
            if (b == 0n) return `N/A`
            let percent = (a * 100n / b) - 100n
            if (percent > 0) return `${format(b)} +${percent}%`
            return `${format(b)} ${percent}%`
        }
        function embed(user: User, data: WrappedUserData, compare?: WrappedUserData) {
            let e = new EmbedBuilder()
            e.setTitle(user.username)
            e.addFields({
                name: "Money", value: Object.keys(data.money).map(k => {
                    let id = k as CurrencyID
                    let aAmount = data.money[id]
                    return `${moneyFormat(aAmount, id)}` + (compare ? ` ⎯ **${comparePercent(aAmount, compare.money[id])}**` : ``)
                }).join("\n")
            })
            e.addFields({ name: "Multiplier", value: `${data.getMul()}` + (compare ? ` ⎯ **${comparePercent(data.getMul(), compare.getMul())}**` : ``) })
            return e
        }
        let aData = await getUser(a)
        let bData = await getUser(b)
        await msg.reply({ embeds: [embed(a, aData, bData), embed(b, bData, aData)] })
    },
} as Command