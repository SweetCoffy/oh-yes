import { getHotReloadable } from "../../loader.js";
import { Command, MinTaxProgression } from "../../types.js";
import { moneyFormat } from "../../util/formatting.js";
import { getMul } from "../../util/util.js";

export default {
    name: "work",
    aliases: ["freemone"],
    args: [],
    description: "...",
    cooldown: 1000 * 30,
    async run(msg) {
        let { getUser } = eco
        let u = await getUser(msg.author)
        let mul = getMul(u)
        if (u.items.trophy) mul *= 2n
        let points = (BigInt(Math.floor(Math.random() * 750)) + u.workBonus) * mul
        let gold = (BigInt(Math.floor(Math.random() * 90)) + u.workBonus / 8n) * mul
        u.money.points += points
        u.money.gold += gold
        if (u.progression >= MinTaxProgression) u.taxes += (points * (BigInt(u.progression) + 1n) / 8n);
        await msg.reply(`Earned ${moneyFormat(points)} and ${moneyFormat(gold, "gold")}`)
    }
} as Command