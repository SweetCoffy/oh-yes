import { Collection, User } from "discord.js";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { getData } from "../data.js";
import { CurrencyID, Money, OptionalMoney, UserData } from "../types";
import { multiplyMoney } from "../util.js";

interface ItemTypeData {
    name?: string,
    icon?: string,
    price?: OptionalMoney
    description?: string,
    onUse?: (u: UserData, a: bigint) => [bigint, string] | void
}
interface ItemType extends ItemTypeData { }
class ItemType {
    name: string
    icon: string
    price: OptionalMoney = {}
    constructor(name: string, icon: string, obj?: ItemTypeData) {
        this.name = name
        this.icon = icon
        if (obj) {
            for (var k in obj) {
                //@ts-ignore
                this[k] = obj[k]
            }
        }
    }
}
var users: Collection<string, UserData> = new Collection()
var items: Collection<string, ItemType> = new Collection()

items.set("cookie", new ItemType("Cookie", "🍪", {
    price: { points: 10n },
    description: "Increases multiplier[0] by 1/50 per item (rounded down)",
    onUse: (u, a) => void addMul(u, 0, 1n * a / 50n)
}))
items.set("bread", new ItemType("Bread", "🍞", {
    price: { points: 200n / 3n },
    description: "Increases multiplier[0] by 1/5 per item (rounded down)",
    onUse: (u, a) => void addMul(u, 0, 1n * a / 5n)
}))
items.set("baguette", new ItemType("Baguette", "🥖", {
    price: { points: 500n },
    description: "Increases multiplier[0] by 1/2 per item (rounded down)",
    onUse: (u, a) => void addMul(u, 0, 1n * a / 2n - (a / 10n))
}))

items.set("spaghet", new ItemType("Spaghet", "🍝", {
    price: { points: 1000n, gold: 10n },
    description: "Increases multiplier[0] by 1 per item",
    onUse: (u, a) => void addMul(u, 0, 1n * a)
}))
items.set("moon_cake", new ItemType("Moon Cake", "🥮", {
    price: { points: 1900n, gold: 50n },
    description: "Increases multiplier[0] by 2.25 per item",
    onUse: (u, a) => void addMul(u, 0, 2n * a + (a / 4n))
}))
items.set("avocado", new ItemType("Avocado", "🥑", {
    price: { points: 6499n },
    description: "Increases multiplier[0] by 7.25 and multiplier[1] by 0.05 per item",
    onUse: (u, a) => {
        addMul(u, 0, a * 7n + (a / 4n))
        addMul(u, 1, a / 20n)
    },
}))

items.set("milk", new ItemType("Milk", "🥛", {
    price: { points: 29999n },
    description: "Increases multiplier[1] by 1 per item",
    onUse: (u, a) => {
        addMul(u, 1, 1n * a)
    }
}))

items.set("egg", new ItemType("Egg", "🥚", {
    price: { points: 1_000_000n, gold: 5000n },
    description: "Increases multiplier[0] by 500 K per item",
    onUse: (u, a) => {
        addMul(u, 0, 500_000n)
    }
}))

items.set("trophy", new ItemType("Trophy", "🏆", {
    price: { points: 250_000_000n, gold: 1_000_000n },
    description: "Increases multiplier[0] by 150 M per item",
    onUse: (u, a) => {
        addMul(u, 0, a * 150_000_000n)
    }
}))

items.set("car", new ItemType("Venezuela Car", "🚗", {
    price: { points: 1_000_000_000n },
    description: "Increases Work Bonus by 0.5 per item",
    onUse: (u, a) => {
        u.workBonus += a + (a / 2n)
    }
}))

items.set("gambling_pass", new ItemType("Gambling Pass", "🎫", {
    price: { points: 1_000_000_000n, gold: 1_000_000_000n },
    description: "Gives you the ability to use the non-existent gamble command"
}))

items.set("ultimate_stonks", new ItemType("Ultimate Stonks", "⚠️", {
    price: { points: 2n ** 1024n },
    description: "Please go touch some grass",
    onUse: (u, a) => {
        return [a, "Go touch some grass"]
    }
}))

items.sort((a, b, ak, bk) => Number(Object.values(b.price).reduce((prev, cur) => prev + cur, 0n) -
    Object.values(a.price).reduce((prev, cur) => prev + cur, 0n)))

function addMul(u: UserData, i: number, amt: bigint) {
    if (!u.multipliers[i]) {
        u.multipliers[i] = 1n
        u.multipliers.forEach((v, i) => u.multipliers[i] = v ?? 1)
    }
    u.multipliers[i] += amt
}
async function getUser(user: User): Promise<UserData> {
    if (users.has(user.id)) return users.get(user.id) as UserData
    var o = await getData(user.id)
    var obj: UserData = {
        money: { points: 3000n, gold: 150n },
        multipliers: [1n],
        items: {},
        workBonus: 0n,
        aliases: {},
        ...o,
    }
    users.set(user.id, obj)
    return obj
}
async function saveUser(id: string | User): Promise<void> {
    if (id instanceof User) id = id.id;
    if (!users.has(id)) return
    await writeFile(`data/${id}.json`, JSON.stringify(users.get(id), (_, v) => {
        if (typeof v == "bigint") return "\u6969" + v
        return v
    }))
    users.delete(id)
}
async function saveAllUsers() {
    await Promise.all(users.map((v, k) => saveUser(k)))
}
export default {
    getUser,
    saveUser,
    saveAllUsers,
    items,
    addMul
}