import { Command } from "../types";
import { search } from "youtube-search-without-api-key"
export default {
    name: "youtube-search",
    aliases: ["yt", "yt-search", "youtube"],
    description: "suspicious activity",
    args: [{ name: "...terms", type: "string", required: true, minCount: 1 }],
    async run(msg, terms: string[]) {
        var query = terms.join(" ")
        if (!query) return await msg.reply("Can't search for nothing")
        var results = await search(query)
        await msg.reply(results[0].url)
    }
} as Command