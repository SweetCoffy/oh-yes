import { Collection, User } from "discord.js";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { getData } from "../data.js";
import { UserData } from "../types";

var users: Collection<string, UserData> = new Collection()

async function getUser(user: User): Promise<UserData> {
    if (users.has(user.id)) return users.get(user.id) as UserData
    var o = await getData(user.id)
    var obj: UserData = {
        money: { points: 0, gold: 0 },
        multipliers: [1],
        ...o,
    }
    users.set(user.id, obj)
    return obj
}
async function saveUser(id: string | User): Promise<void> {
    if (id instanceof User) id = id.id;
    if (!users.has(id)) return
    await writeFile(`data/${id}.json`, JSON.stringify(users.get(id)))
    users.delete(id)
}
async function saveAllUsers() {
    await Promise.all(users.map((v, k) => saveUser(k)))
}
export default {
    getUser,
    saveUser,
    saveAllUsers,
}