import { User } from "discord.js";
import { Command } from "../types.js";

export default {
    name: "avatar",
    description: "Shows a user's avatar",
    args: [{ type: "user", name: "user", required: false, errorIfMissing: false }],
    aliases: ["pfp"],
    async run(msg, user: User) {
        user = user || msg.author
        await msg.reply({
            embeds: [
                {
                    title: `${user.username}'s avatar`,
                    image: {
                        url: user.displayAvatarURL({ size: 4096 })
                    }
                }
            ]
        })
    }
} as Command