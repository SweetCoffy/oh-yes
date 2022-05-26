import { EmbedBuilder, User } from "discord.js";
import { getHotReloadable } from "../../loader.js";
import { Command } from "../../types";
import { allMoneyFormat, format, getMul, moneyFormat } from "../../util.js";

export default {
    name: "stonks",
    description: "Shows an user's info",
    aliases: ["stats", "profile", "bal"],
    args: [{ type: "user", errorIfMissing: false, required: false, name: "user" }],
    async run(msg, user: User) {
        var { getUser } = getHotReloadable().eco
        var u = user || msg.author
        var data = await getUser(u)
        await msg.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: u.username, iconURL: u.displayAvatarURL() })
                    .setDescription(
                        `Mone: ${allMoneyFormat(data.money)}
Multiplier: ${data.multipliers.join(" * ")} (${format(getMul(data))})
Work bonus: +${format(data.workBonus)} (Maximum profit: ${allMoneyFormat({ points: (data.workBonus + 25n) * getMul(data), gold: (data.workBonus / 8n + 3n) * getMul(data) })})`)]
        })
    }
} as Command