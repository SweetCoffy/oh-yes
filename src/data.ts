import { existsSync } from "fs";
import { readFile } from "fs/promises"

export async function getData(id: string): Promise<any> {
    if (existsSync(`data/${id}.json`)) {
        return JSON.parse(await readFile(`data/${id}.json`, "utf8"))
    } else {
        return undefined
    }
}