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