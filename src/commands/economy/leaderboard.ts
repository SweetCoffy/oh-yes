import { User } from "discord.js";
import { readdir } from "fs/promises";
import { basename } from "path";
import { getHotReloadable } from "../../loader.js";
import { Command, UserData } from "../../types.js";
import { allMoneyFormat } from "../../util.js";

export default {
    name: "leaderboard",
    aliases: ["baltop"],
    args: [],
    description: "Shows a list of users sorted by most money",
    async run(msg) {
        function sign(a: bigint) {
            if (a > 0n) return 1n
            if (a < 0n) return -1n
            return a
        }
        function thing(a: bigint, b: bigint) {
            return Number(sign(a - b))
        }
        var { getUser } = getHotReloadable().eco
        var files = await readdir("data")
        var users = await (await Promise.allSettled(files.map(el => msg.client.users.fetch(basename(el, ".json")))))
            .filter(el => el.status == "fulfilled")
            .map(el => el.status == "fulfilled" && el.value) as User[]
        var data = await Promise.all(users.map(async user => [user, await getUser(user)])) as [User, UserData][]
        data.sort(([_1, a], [_2, b]) => thing(b.money.points, a.money.points))
        await msg.reply({
            content: `${data.map(([user, data], i) => `#${i + 1} ${user.username}: ${allMoneyFormat(data.money)}`).join("\n")}`
        })
    }
} as Command