import { load, DEFAULT_SCHEMA, Schema, Type } from "js-yaml"
import { readFile, readdir } from "fs/promises"
import { eco, rarities, Rarity, readdirR } from "../util.js"
import { ItemTypeData } from "./economy.js";
import { join } from "path";
import { Progression } from "../types.js";
import { getHotReloadable } from "../loader.js";

var { items, ItemType } = eco()

interface ContentType<T> {
    getValue: (obj: any, id: string) => T | null,
    map: Map<string, T>,
    schema: NodeJS.Dict<any>,
}

const types = new Map<string, ContentType<any>>();
types.set("ItemType", {
    getValue: (obj: ItemTypeData, id: string) => {
        var it = items.get(id)
        if (it) {
            it.patch(obj)
            return it
        }
        return new ItemType("YAML Placeholder", "Y", obj)
    },
    map: items,
    schema: {},
})
const ContentPath = "content"
const customSchema = DEFAULT_SCHEMA.extend([
    new Type("!bigint", {
        kind: "scalar",
        resolve: data => !isNaN(data),
        construct: data => BigInt(data),
        represent: value => value + "",
        instanceOf: (v: any) => typeof v == "bigint"
    }),
    new Type("!rarity", {
        kind: "scalar",
        resolve: data => data in Rarity,
        //@ts-ignore
        construct: data => Rarity[data],
        represent: value => value + "",
        instanceOf: (v: any) => false
    }),
    new Type("!progression", {
        kind: "scalar",
        resolve: data => data in Progression,
        //@ts-ignore
        construct: data => Progression[data],
        represent: value => value + "",
        instanceOf: (v: any) => false
    }),
    new Type("!function", {
        kind: "mapping",
        resolve: data => typeof data.from == "string" || (Array.isArray(data.args) && typeof data.code == "string"),
        construct: data => typeof data.from == "string" ?
            data.from.split(".").reduce((prev: any, cur: string) => prev[cur], getHotReloadable()) :
            new Function(...data.args, data.code),
        represent: value => "",
        instanceOf: (v: any) => typeof v == "function"
    })
])
async function loadFile(path: string) {
    console.log(`Loading file: ${path}`)
    var obj = load(await readFile(path, "utf8"), { schema: customSchema }) as any
    var defaultType = obj.DefaultType
    delete obj.DefaultType
    for (var k in obj) {
        var o = obj[k]
        var type = types.get(o.type || defaultType)
        delete o.type
        if (!type) {
            console.log(`${k} has an invalid type: '${o.type || defaultType}'`)
            continue
        }
        var val = type.getValue(o, k)
        console.log(val)
        type.map.set(k, val)
        console.log(`Added '${k}'`)
    }
}

async function loadAll() {
    console.log(`Loading YAML`)
    await Promise.all((await readdirR(ContentPath)).filter(v => v.endsWith(".yml")).map(v => loadFile(join(ContentPath, v))))
}

export default {
    loadAll,
}