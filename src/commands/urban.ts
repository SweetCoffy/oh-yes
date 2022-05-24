import { Command } from "../types";

interface UDDefinition {
    word: string,
    author: string,
    example: string,
    definition: string,
    thumbs_up: number,
    thumbs_down: number,
}

export default {
    name: "urban",
    aliases: ["urbandictionary", "ud", "baddefinition"],
    description: "ported from original oh yes",
    args: [
        {
            name: "...term",
            type: "string",
            required: true,
        }],
    async run(msg, terms: string[]) {
        await msg.react('🔍')
        var term = terms.join(" ")
        var regex = /\[(.+?)\]/g
        function uFormat(str: string) {
            return str.replace(regex, (sub, term: string) => {
                return `[${term}](https://www.urbandictionary.com/define.php?term=${encodeURIComponent(term)})`
            })
        }
        function format(n: any) {
            return n + ""
        }
        try {
            var defs: UDDefinition[] = (await (await fetch(`http://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`)).json()).list
            //console.log(defs)
            var def = defs.sort((a: any, b: any) => b.thumbs_up - a.thumbs_up)[0]
            if (!def) return await msg.reply("No definitions?")
            var e = uFormat(def.example)
            var d = uFormat(def.definition)
            var embed = {
                author: {
                    name: def.author
                },
                title: `${def.word}`,
                color: 0x4287f5,
                description: uFormat(def.definition).slice(0, 2048),
                fields: [
                    {
                        name: "👍",
                        value: format(def.thumbs_up),
                        inline: true,
                    },
                    {
                        name: "👎",
                        value: format(def.thumbs_down),
                        inline: true,
                    },
                ]
            }
            var embed2 = { title: "Example", description: e.slice(0, 2048), color: 0x4287f5 };
            var embed3: any = {
                description: uFormat(def.definition).slice(2048, 2048 * 2),
                color: 0x4287f5,
            }
            if (uFormat(def.definition).length > 2048) {
                embed3.fields = embed.fields;
                embed.fields = [];
            }
            await msg.channel.send({ embeds: [embed] })
            if (d.length > 2048) await msg.channel.send({ embeds: [embed3] })
            if (e) await msg.channel.send({ embeds: [embed2] })
        } catch (err) {
            console.error(err)
        }
    }
} as Command