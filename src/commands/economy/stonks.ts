import { EmbedBuilder, User } from "discord.js";
import { getHotReloadable } from "../../loader.js";
import { Command } from "../../types";
import { allMoneyFormat, eco, format, getMul, itemString, moneyFormat } from "../../util.js";

export default {
    name: "stonks",
    description: "Shows a user's info",
    aliases: ["stats", "profile", "bal"],
    args: [{ type: "user", errorIfMissing: false, required: false, name: "user" }],
    async run(msg, user: User) {
        let { getUser } = getHotReloadable().eco
        let u = user || msg.author
        let data = await getUser(u)
        await msg.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: u.username, iconURL: u.displayAvatarURL() })
                    .setDescription(
                        `Mone: ${allMoneyFormat(data.money)}
Multiplier: ${data.multipliers.join(" * ")} (${format(getMul(data))})
Work bonus: +${format(data.workBonus)} (Maximum profit: ${allMoneyFormat({ points: (data.workBonus + 50n) * getMul(data), gold: (data.workBonus / 8n + 6n) * getMul(data) })})
${Object.keys(data.items).filter(v => data.items[v]).filter(v => eco().items.get(v)?.category == "utility").map(el => itemString(el, undefined, true)).join(" ")}
`)]
        })
    }
} as Command