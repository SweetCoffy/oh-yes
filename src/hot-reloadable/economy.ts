import { Collection, User } from "discord.js";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { getData } from "../data.js";
import { Money, OptionalMoney, PhoneMaxTier, Progression, UserData, VzPriceMul } from "../types.js";
import { allMoneyFormat, divideMoney, formatNumber, multiplyMoney, format, formatFraction, titleCase, splitCamelCase, xTimes, BigIntFraction, getDiscount, max, enumeration, lcmArray, dataWrapper, WrappedUserData } from "../util.js";

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
let rarities: RarityInfo[] = []
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
    lore?: string,
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
                let f = this.value as BigIntFraction[];
                let lcm = lcmArray(...f.map(el => el[1]))
                if (long) return `${this.toString(false)}\nBest value when using multiples of: ${lcm}`
                if (!long) return (this.value as bigint[][]).map((v, i) => ({
                    i,
                    frac: v as BigIntFraction,
                })).filter(v => v.frac[0] > 0n).map(v =>
                    `M[${v.i}] += ${formatFraction(v.frac)}`).join(", ")
            case ItemAttributeType.GenericFraction:
                return `${formatFraction(this.value as BigIntFraction)}`
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
export enum ItemAttributeType {
    Default,
    Money,
    BigInt,
    Multiplier,
    GenericFraction,
    TaxEvasion,
}
let attrNameTypeMap: NodeJS.Dict<ItemAttributeType> = {
    multiplier: ItemAttributeType.Multiplier,
    price: ItemAttributeType.Money,
    workBonus: ItemAttributeType.GenericFraction,
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
     * Whether or not a user can only have one of this item in their inventory. Useful for utility items.
     */
    unique: boolean = false
    sourceFiles: string[]
    patch(obj: ItemTypeData) {
        for (let k in obj) {
            //@ts-ignore
            let v = obj[k];
            //@ts-ignore
            let thisV = this[k];
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
        this.sourceFiles = []
        if (obj) {
            this.patch(obj)
        }
    }
}

let users: Collection<string, WrappedUserData> = new Collection()
let items: Collection<string, ItemType> = new Collection()

items.sort((a, b, ak, bk) => Number(Object.values(b.price).reduce((prev, cur) => prev + cur, 0n) -
    Object.values(a.price).reduce((prev, cur) => prev + cur, 0n)))

function addMul(u: UserData, i: number, amt: bigint) {
    if (!u.multipliers[i]) {
        u.multipliers[i] = 1n
        u.multipliers.forEach((v, i) => u.multipliers[i] = v ?? 1)
    }
    u.multipliers[i] += amt
}
async function getUser(user: User): Promise<WrappedUserData> {
    if (users.has(user.id)) return users.get(user.id) as WrappedUserData
    let o = await getData(user.id)
    let obj: UserData = {
        multipliers: [1n],
        items: {},
        workBonus: 0n,
        aliases: {},
        vzMode: false,
        taxes: 0n,
        progression: 0,
        taxEvasion: 0,
        evadedTaxes: 0,
        messageCooldown: 0,
        ...o,
        // Phone info is always present regardless of whether or not the user has a phone
        phone: {
            orderPaused: false,
            orderQueue: [],
            tier: 0n,
            ...(o?.phone || {}),
        },
        money: {
            points: 3000n,
            gold: 150n,
            sus: 0n,
            ...(o?.money || {}),
        },
        cooldowns: {
            ...(o?.cooldowns || {})
        }
    }
    let wrapper = dataWrapper(obj)
    users.set(user.id, wrapper)
    return wrapper
}
async function saveUser(id: string | User): Promise<void> {
    if (id instanceof User) id = id.id;
    let data = users.get(id)
    if (!data) return
    await writeFile(`data/${id}.json`, JSON.stringify(data, (_, v) => {
        if (typeof v == "bigint") return "\u6969" + v
        return v
    }))
    console.log(`Saved user '${id}'`)
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
function getPrice(item: string, u: WrappedUserData, amount: bigint): OptionalMoney {
    let info = items.get(item)
    if (!info) return {}
    if (u.items.suspicious_developer_item) return {}
    let ml = 1n
    if (u.vzMode) ml *= VzPriceMul
    let price = multiplyMoney(info.price, amount * ml)
    if (u.hasPhone()) price = divideMoney(multiplyMoney(price, 100n - getDiscount(u.phone.tier)), 100n)
    return price
}
/**
 * Determines whether or not the user can buy this item.
 * @param item 
 * @param u 
 * @returns 
 */
function itemAvailable(item: string, u: UserData): boolean {
    let info = items.get(item)
    if (!info) return false
    if (info.vzOnly && !u.vzMode) return false
    if (info.minProgress > u.progression) return false
    return true
}
const progressionInfo: { [x in Progression]: { title: string, description: string, maxPhoneTier: bigint } } = {
    [Progression.None]: {
        title: "The Start",
        description: "...",
        maxPhoneTier: 1n,
    },
    [Progression.VenezuelaMode]: {
        title: "Venezuela",
        description: `Venezuela Mode has been activated for the first time. Item prices will be ${(VzPriceMul * 100n) - 100n}% higher while activated. (Oh yeah, taxes exist now.)`,
        maxPhoneTier: 5n,
    },
    [Progression.PostVenezuela]: {
        title: "Post-Venezuela",
        description: "Venezuela Mode has been deactivated for the first time and item prices are back to normal. However, some items will only be available while Venezuela Mode is activated",
        maxPhoneTier: 15n,
    },
    // There are more stages to come in between these two, but I decided to add this here anyways.
    [Progression.TheEnd]: {
        title: "The End",
        description: "How did you even-",
        maxPhoneTier: PhoneMaxTier,
    }
}
function getUnlockedItems(prev: Progression, cur: Progression) {
    let prevUnlock = items.filter(v => v.minProgress <= prev)
    let unlock = items.filter(v => v.minProgress <= cur)
    return unlock.difference(prevUnlock)
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
    Rarity: Rarity,
    rarities,
    ItemAttributeType,
    progressionInfo,
    getUnlockedItems,
}