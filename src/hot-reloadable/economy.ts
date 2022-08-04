import { Collection, User } from "discord.js";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { getData } from "../data.js";
import { CurrencyID, Money, OptionalMoney, Progression, UserData, VZ_PRICEMUL } from "../types.js";
import { divideMoney, multiplyMoney } from "../util.js";

var rarity = {
    JUNK: 0,
    COMMON: 1,
    UNCOMMON: 2,
    RARE: 3,
    EPIC: 4,
    LEGENDARY: 5,
    MYTHICAL: 6,
    UNIQUE: 7,
}
interface Rarity {
    name: string,
    color: number,
}
var rarities: Rarity[] = []
rarities[rarity.JUNK] = {
    name: "Junk",
    color: 0x12_12_12,
}
rarities[rarity.COMMON] = {
    name: "Common",
    color: 0xFF_FF_FF,
}
rarities[rarity.UNCOMMON] = {
    name: "Uncommon",
    color: 0x28_FC_03,
}
rarities[rarity.RARE] = {
    name: "Rare",
    color: 0x03_5A_FC,
}
rarities[rarity.EPIC] = {
    name: "Epic",
    color: 0xCA_03_FC,
}
rarities[rarity.LEGENDARY] = {
    name: "Legendary",
    color: 0xFF_80_EE,
}
rarities[rarity.MYTHICAL] = {
    name: "Mythical",
    color: 0xFC_BA_03,
}
rarities[rarity.UNIQUE] = {
    name: "Unique",
    color: 0xFF_5D_3D
}
export type CategoryType = "consumable" | "utility" | "unique" | "none"
export interface ItemTypeData {
    name?: string,
    icon?: string,
    price?: OptionalMoney
    description?: string,
    unlisted?: boolean,
    rarity?: number,
    unique?: boolean,
    category?: CategoryType,
    minProgress?: Progression,
    vzOnly?: boolean,
    onUse?: (u: UserData, a: bigint) => [bigint, string] | void
}
interface ItemType extends ItemTypeData { }
class ItemType {
    name: string
    icon: string
    rarity: number = rarity.COMMON
    price: OptionalMoney = {}
    category: CategoryType = "none"
    minProgress: Progression = Progression.None
    vzOnly: boolean = false
    get buyPrice(): OptionalMoney {
        return this.price
    }
    unique: boolean = false
    patch(obj: ItemTypeData) {
        for (var k in obj) {
            //@ts-ignore
            this[k] = obj[k]
        }
    }
    constructor(name: string, icon: string, obj?: ItemTypeData) {
        this.name = name
        this.icon = icon
        if (obj) {
            this.patch(obj)
        }
    }
}
// class ComputerComponentItemType extends ItemType {
//     perf: number
//     constructor(name: string, icon: string, obj: ItemTypeData & { perf: number }) {
//         super(name, icon, obj)
//         this.perf = obj.perf
//     }
// }
// class CPUItemType extends ComputerComponentItemType { }
// class GPUItemType extends ComputerComponentItemType { }
var users: Collection<string, UserData> = new Collection()
var items: Collection<string, ItemType> = new Collection()

// items.set("intol_xeson_get_real", new CPUItemType("Intol™ Xeson© Get Real", "<:intolxesongetreal:980699295084871700>", {
//     perf: 5,
//     rarity: rarity.LEGENDARY,
//     price: { points: 69_000n }
// }))
// items.set("raeon_titan_42069fx_rush_2", new GPUItemType("Raeon© Titan 42069fx Rush 2", "<:raeon42069fxrush2:980699296196362300>", {
//     perf: 6,
//     rarity: rarity.LEGENDARY,
//     price: { points: 420_690n }
// }))

// items.set("intol_pentsus_real", new CPUItemType("Intol™ Pentsus© Real", "⬛", {
//     perf: 0.1,
//     rarity: rarity.RARE_PLUS,
//     description: "A \"Cutting Edge\" Pentsus Processor",
//     price: { points: 5000n },
// }))
// items.set("nved_force_1_h", new GPUItemType("NVed™ Force 1 H", "⬛", {
//     perf: 0.11,
//     rarity: rarity.RARE_PLUS,
//     description: "Barely any better than integrated graphics",
//     price: { points: 7500n },
// }))
items.set("cookie", new ItemType("Cookie", "🍪", {
    price: { points: 10n },
    rarity: rarity.JUNK,
    category: "consumable",
    description: "Increases multiplier[0] by 1/50 per item (rounded down)",
    onUse: (u, a) => void addMul(u, 0, 1n * a / 50n)
}))
items.set("bread", new ItemType("Bread", "🍞", {
    price: { points: 200n / 3n },
    rarity: rarity.COMMON,
    category: "consumable",
    description: "Increases multiplier[0] by 1/5 per item (rounded down)",
    onUse: (u, a) => void addMul(u, 0, 1n * a / 5n)
}))
items.set("baguette", new ItemType("Baguette", "🥖", {
    price: { points: 500n },
    rarity: rarity.COMMON,
    category: "consumable",
    description: "Increases multiplier[0] by 1/2 per item (rounded down)",
    onUse: (u, a) => void addMul(u, 0, 1n * a / 2n - (a / 10n))
}))

items.set("spaghet", new ItemType("Spaghet", "🍝", {
    price: { points: 1000n, gold: 10n },
    rarity: rarity.COMMON,
    category: "consumable",
    description: "Increases multiplier[0] by 1 per item",
    onUse: (u, a) => void addMul(u, 0, 1n * a)
}))
items.set("moon_cake", new ItemType("Moon Cake", "🥮", {
    price: { points: 1900n, gold: 50n },
    rarity: rarity.UNCOMMON,
    category: "consumable",
    description: "Increases multiplier[0] by 2.25 per item",
    onUse: (u, a) => void addMul(u, 0, 2n * a + (a / 4n))
}))
items.set("avocado", new ItemType("Avocado", "🥑", {
    price: { points: 6499n },
    rarity: rarity.UNCOMMON,
    category: "consumable",
    description: "Increases multiplier[0] by 7.25 and multiplier[1] by 0.05 per item",
    onUse: (u, a) => {
        addMul(u, 0, a * 7n + (a / 4n))
    },
}))

items.set("egg", new ItemType("Egg", "🥚", {
    price: { points: 1_000_000n, gold: 5000n },
    description: "Increases multiplier[0] by 500 K per item",
    rarity: rarity.EPIC,
    category: "consumable",
    onUse: (u, a) => {
        addMul(u, 0, 500_000n)
    }
}))

items.set("milk", new ItemType("Milk", "🥛", {
    price: { points: 24_000_000n },
    rarity: rarity.EPIC,
    category: "consumable",
    vzOnly: true,
    description: "Increases multiplier[1] by 1 per item",
    onUse: (u, a) => {
        addMul(u, 1, 1n * a)
    }
}))

items.set("venezuela_flag", new ItemType("Venezuela Flag", "🇻🇪", {
    price: { points: 100_000_000n },
    rarity: rarity.EPIC,
    category: "consumable",
    description: "Enables Venezuela mode",
    onUse: (u, a) => {
        if (u.progression < Progression.VenezuelaMode) u.progression = Progression.VenezuelaMode
        u.vzMode = true
    }
}))

items.set("car", new ItemType("Venezuela Car", "🚗", {
    price: { points: 100_000_000n },
    description: "Increases Work Bonus by 0.5 per item\nGuarantees evading taxes once",
    rarity: rarity.LEGENDARY,
    category: "consumable",
    vzOnly: true,
    onUse: (u, a) => {
        u.workBonus += a + (a / 2n)
        u.taxevasion = 1
    }
}))

items.set("trophy", new ItemType("Trophy", "🏆", {
    price: { points: 1_000_000_000n, gold: 1_000_000n },
    description: "Doubles money gained from work",
    rarity: rarity.EPIC,
    unique: true,
    category: "utility",
}))
items.set("gambling_pass", new ItemType("Gambling Pass", "🎫", {
    price: { points: 1_000_000_000n, gold: 1_000_000_000n },
    rarity: rarity.LEGENDARY,
    unique: true,
    category: "utility",
    description: "Enables gambling"
}))
items.set("phone", new ItemType("Phone", "📱", {
    price: { points: 1_000_000_000n },
    rarity: rarity.UNIQUE,
    category: "utility",
    description: "Grants a 5% discount for all items in the shop",
    unique: true,
}))

items.set("ultimate_stonks", new ItemType("Ultimate Stonks", "⚠️", {
    price: { points: 2n ** 1024n },
    rarity: rarity.MYTHICAL,
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
        multipliers: [1n],
        items: {},
        workBonus: 0n,
        aliases: {},
        vzMode: false,
        taxes: 0n,
        progression: 0,
        taxevasion: 0,
        phone: {

        },
        ...o,
        money: { points: o?.money?.points ?? 3000n, gold: o?.money?.gold ?? 150n, sus: o?.money?.sus ?? 0n },
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
function getPrice(item: string, u: UserData, amount: bigint): OptionalMoney {
    var info = items.get(item)
    if (!info) return {}
    if (u.items.suspicious_developer_item) return {}
    var ml = 1n
    if (u.vzMode) ml *= VZ_PRICEMUL
    var price = multiplyMoney(info.price, amount * ml)
    if (u.items.phone) price = divideMoney(multiplyMoney(price, 95n), 100n)
    return price
}
function itemAvailable(item: string, u: UserData): boolean {
    var info = items.get(item)
    if (!info) return false
    if (info.vzOnly && !u.vzMode) return false
    if (info.minProgress > u.progression) return false
    return true
}
const progressionMessages: { [x in Progression]: string } = {
    // Should never happen, but it's still here just in case (and so that VS Code doesn't yell at me for not including it)
    [Progression.None]: "How did you even get this message?",

    [Progression.VenezuelaMode]:
        "You have enabled Venezuela Mode for the first time, be prepared for significantly higher item prices and pain." +
        " On the plus side, you've unlocked some new items on the shop"
}
export default {
    getUser,
    saveUser,
    saveAllUsers,
    items,
    addMul,
    getPrice,
    itemAvailable,
    ItemType,
    // ComputerComponentItemType,
    // CPUItemType,
    // GPUItemType,
    rarity,
    rarities,
    progressionMessages,
}