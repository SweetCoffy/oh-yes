import { Collection, User } from "discord.js";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { getData } from "../data.js";
import { CurrencyID, Money, OptionalMoney, Progression, UserData, VzPriceMul } from "../types.js";
import { allMoneyFormat, divideMoney, formatNumber, multiplyMoney, format, formatFraction, titleCase, splitCamelCase, getPartialFrac, xTimes } from "../util.js";

enum Rarity {
    Junk = 0,
    Common = 1,
    Uncommon = 2,
    Rare = 3,
    Epic = 4,
    Legendary = 5,
    Mythical = 6,
    Unique = 7,
}
interface RarityInfo {
    name: string,
    color: number,
}
var rarities: RarityInfo[] = []
rarities[Rarity.Junk] = {
    name: "Junk",
    color: 0x12_12_12,
}
rarities[Rarity.Common] = {
    name: "Common",
    color: 0xFF_FF_FF,
}
rarities[Rarity.Uncommon] = {
    name: "Uncommon",
    color: 0x28_FC_03,
}
rarities[Rarity.Rare] = {
    name: "Rare",
    color: 0x03_5A_FC,
}
rarities[Rarity.Epic] = {
    name: "Epic",
    color: 0xCA_03_FC,
}
rarities[Rarity.Legendary] = {
    name: "Legendary",
    color: 0xFF_80_EE,
}
rarities[Rarity.Mythical] = {
    name: "Mythical",
    color: 0xFC_BA_03,
}
rarities[Rarity.Unique] = {
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
    rarity?: Rarity,
    unique?: boolean,
    category?: CategoryType,
    minProgress?: Progression,
    vzOnly?: boolean,
    attributes?: Collection<string, unknown | ItemAttributeData>,
    onUse?: (u: UserData, a: bigint, type: ItemType) => [bigint, string] | void
}
interface ItemAttributeData {
    key: string,
    name: string,
    type: ItemAttributeType,
    value: unknown,
}
class ItemAttribute {
    key: string
    name: string
    type: ItemAttributeType
    store: NodeJS.Dict<unknown>
    get value(): unknown {
        return this.store[this.key];
    }
    set value(value: unknown) {
        this.store[this.key] = value;
    }
    toString(long = false): string {
        switch (this.type) {
            case ItemAttributeType.BigInt:
                return format(this.value as bigint)
            case ItemAttributeType.Money:
                return allMoneyFormat(this.value as OptionalMoney)
            case ItemAttributeType.Multiplier:
                return (this.value as bigint[][]).map((v, i) => ({
                    i,
                    base: v[0],
                    factors: v.slice(1).map((j, c) => ({ div: 2n ** BigInt(c + 1), value: j })).filter(v => v.value > 0n),
                })).filter(v => v.base > 0n || v.factors.some(f => f.value > 0n)).map(v =>
                    `M[${v.i}] += ${[format(v.base), ...v.factors.map(e => formatFraction([e.value, e.div]))].join(" + ")}`).join(", ")
            case ItemAttributeType.GenericPartial:
                return `${formatFraction(getPartialFrac(this.value as bigint[]))}`
            case ItemAttributeType.TaxEvasion:
                let e = this.value as number
                return e > 0 ? `Yes (${xTimes(e)})` : `No`
        }
        return this.value?.toString() ?? "N/A";
    }
    constructor(data: ItemAttributeData, store: NodeJS.Dict<unknown>) {
        this.key = data.key;
        this.name = data.name;
        this.type = data.type;
        this.store = store;
        this.value = data.value;
    }
}
enum ItemAttributeType {
    Default,
    Money,
    BigInt,
    Multiplier,
    GenericPartial,
    TaxEvasion,
}
var attrNameTypeMap: NodeJS.Dict<ItemAttributeType> = {
    multiplier: ItemAttributeType.Multiplier,
    price: ItemAttributeType.Money,
    workBonus: ItemAttributeType.GenericPartial,
    evadeTaxes: ItemAttributeType.TaxEvasion,
}
export interface ItemType extends ItemTypeData { }
export class ItemType {
    name: string
    icon: string
    rarity: Rarity = Rarity.Common
    price: OptionalMoney = {}
    category: CategoryType = "none"
    /**
     * Minimum progression required in order to buy this item.
     */
    minProgress: Progression = Progression.None
    vzOnly: boolean = false
    /**
     * A collection of `ItemAttribute` containing the attributes of this `ItemType`. Item attributes can be used to set item properties that will be shown in a specific way when showing item info
     */
    attributes: Collection<string, ItemAttribute>
    /**
     * Stores `ItemAttribute` values.
     */
    _attrData: NodeJS.Dict<unknown>
    get buyPrice(): OptionalMoney {
        return this.price
    }
    /**
     * Whether or not an user can only have one of this item in their inventory. Useful for utility items.
     */
    unique: boolean = false
    patch(obj: ItemTypeData) {
        for (var k in obj) {
            //@ts-ignore
            var v = obj[k];
            //@ts-ignore
            var thisV = this[k];
            if (thisV instanceof Collection && !(v instanceof Collection)) {
                v = new Collection(Object.entries(v))
            }
            if (v instanceof Collection && thisV instanceof Collection) {
                if (k == "attributes") {
                    for (let [attr, value] of v) {
                        let a: ItemAttributeData =
                            { key: attr, name: titleCase(splitCamelCase(attr)), value: null, type: attrNameTypeMap[attr] ?? ItemAttributeType.Default }
                        if (typeof value == "object" && !Array.isArray(value)) {
                            if ("name" in value) a.name = value.name;
                            if ("type" in value) a.type = value.type;
                            if ("value" in value) a.value = value.value;
                        } else {

                            a.value = value
                        }
                        thisV.set(attr, new ItemAttribute(a, this._attrData))
                    }
                } else v.forEach((v, k) => thisV.set(k, v))
            } else {
                //@ts-ignore
                this[k] = v
            }
        }
        console.log(this.attributes)
    }
    constructor(name: string, icon: string, obj?: ItemTypeData) {
        this.name = name
        this.icon = icon
        this.attributes = new Collection()
        this._attrData = {}
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
        evadedTaxes: 0,
        phone: {

            ...(o?.phone || {}),
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
/**
 * Determines the price of `item` for the user. Taking into account Venezuela Mode and other factors.
 * @param item j
 * @param u j
 * @param amount j
 */
function getPrice(item: string, u: UserData, amount: bigint): OptionalMoney {
    var info = items.get(item)
    if (!info) return {}
    if (u.items.suspicious_developer_item) return {}
    var ml = 1n
    if (u.vzMode) ml *= VzPriceMul
    var price = multiplyMoney(info.price, amount * ml)
    if (u.items.phone) price = divideMoney(multiplyMoney(price, 95n), 100n)
    return price
}
/**
 * Determines whether or not the user can buy this item.
 * @param item 
 * @param u 
 * @returns 
 */
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
    Rarity: Rarity,
    rarities,
    progressionMessages,
    ItemAttributeType,
}