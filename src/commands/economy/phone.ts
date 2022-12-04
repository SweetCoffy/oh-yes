import { EmbedBuilder, Message } from "discord.js";
import { getHotReloadable } from "../../loader.js";
import { allMoneyFormat } from "../../util/formatting.js";
import { BooleanEnum, getDiscount, getUpgradeCost, getUser, hasMoney, moneyLeft, subtractMoney } from "../../util/util.js";

let { subcommandGroup, addCommandToGroup } = getHotReloadable().commands

let group = subcommandGroup("phone")
group.precondition = async (msg: Message, ...args: any[]) => {
    let u = await getUser(msg.author)
    if (!u.items.phone) {
        await msg.reply(`You need a phone in order to use this command.`);
        return false;
    }
    return true
}

addCommandToGroup(group, {
    name: "info",
    args: [],
    async run(msg) {
        let u = await getUser(msg.author)
        let phone = u.phone
        let maxTier = eco.progressionInfo[u.progression].maxPhoneTier
        let embed = new EmbedBuilder()
            .setTitle(`Phone`)
            .addFields({ name: "Tier", value: `${phone.tier}/${maxTier} (${getDiscount(phone.tier)}% Discount)`, inline: true })
        await msg.reply({ embeds: [embed] })
    },
}, true)
addCommandToGroup(group, {
    name: "upgrade",
    args: [{ name: "yes", type: "enum", enum: BooleanEnum, required: false }],
    async run(msg, noConfirm: boolean) {
        let u = await getUser(msg.author)
        let phone = u.phone
        let cost = { points: getUpgradeCost(phone.tier), gold: getUpgradeCost(phone.tier) / 10n }
        let newDiscount = getDiscount(phone.tier + 1n)
        let maxTier = eco.progressionInfo[u.progression].maxPhoneTier
        if (phone.tier >= maxTier) return await msg.reply(`You have already reached the maximum tier.`)
        if (!noConfirm) {
            let embed = new EmbedBuilder()
                .setTitle("Upgrade")
                .setDescription(`Tier: ${phone.tier} -> ${phone.tier + 1n}\nDiscount: ${getDiscount(phone.tier)}% -> ${newDiscount}%\nUpgrade will cost ${allMoneyFormat(cost)}\nRun the command with the \`true\` argument to confirm.`)
            await msg.reply({ embeds: [embed] })
        } else {
            if (!hasMoney(moneyLeft(u.money, cost))) {
                await msg.reply(`Not enough money.`)
            }
            subtractMoney(u.money, cost)
            phone.tier++
            await msg.reply(`Upgraded`)
        }
    }
})

export default group