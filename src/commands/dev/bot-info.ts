import { Command } from "../../types.js";
import { release, totalmem, type } from "os"
import { EmbedBuilder } from "discord.js";
import { sizeFormat } from "../../formats.js";
import { formatNumber } from "../../util/formatting.js";

export default {
    name: "bot-info",
    async run(msg) {
        let embed = new EmbedBuilder()
            .setTitle(`Bot Info`)
            .setDescription(`**OS**: ${type()} ${release()}\n**Env**: ${process.env.NODE_ENV ?? '???'}\n**Mem**: ${formatNumber(totalmem(), sizeFormat)}\n**Node Ver**: ${process.version}`)
        await msg.reply({ embeds: [embed] })
    },
} as Command