import { Command } from "../../types.js";
import { itemString } from "../../util/formatting.js";
import { addItem, getUser } from "../../util/util.js";

export default {
    name: "give",
    description: "Gives an item to you, with no validation applied.",
    devOnly: true,
    args: [{ name: "item", type: "string", required: true }, { name: "amount", type: "bigint", required: false }],
    async run(msg, item: string, amount: bigint = 1n) {
        let u = await getUser(msg.author)
        addItem(u, item, amount)
        await msg.reply(`${itemString(item, amount)} given.`)
    },
} as Command