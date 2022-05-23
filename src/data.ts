import { existsSync } from "fs";
import { readFile } from "fs/promises"

export async function getData(id: string): Promise<any> {
    if (existsSync(`data/${id}.json`)) {
        return JSON.parse(await readFile(`data/${id}.json`, "utf8"), (_, v) => {
            if (typeof v == "string" && v.startsWith("\u6969")) return BigInt(v.slice(1))
            return v
        })
    } else {
        return undefined
    }
}