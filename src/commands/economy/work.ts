import { getHotReloadable } from "../../loader.js";
import { Command, MinTaxProgression } from "../../types.js";
import { getMul, moneyFormat } from "../../util.js";

export default {
    name: "work",
    aliases: ["freemone"],
    args: [],
    description: "...",
    async run(msg) {
        var { getUser } = getHotReloadable().eco
        var u = await getUser(msg.author)
        var mul = getMul(u)
        if (u.items.trophy) mul *= 2n
        var points = (BigInt(Math.floor(Math.random() * 50)) + u.workBonus) * mul
        var gold = (BigInt(Math.floor(Math.random() * 6)) + u.workBonus / 8n) * mul
        u.money.points += points
        u.money.gold += gold
        if (u.progression >= MinTaxProgression) u.taxes += (points * (BigInt(u.progression) + 1n) / 10n);
        await msg.reply(`Earned ${moneyFormat(points)} and ${moneyFormat(gold, "gold")}`)
    }
} as Command