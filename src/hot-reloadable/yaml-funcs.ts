import { Progression, UserData } from "../types.js";
import { eco } from "../util.js";
var { addMul } = eco()

export default {
    item: {
        example_item: (u: UserData, a: bigint) => u.money.points = 0n,
        cookie: (u: UserData, a: bigint) => void addMul(u, 0, 1n * a / 50n),
        bread: (u: UserData, a: bigint) => void addMul(u, 0, 1n * a / 5n),
        baguette: (u: UserData, a: bigint) => void addMul(u, 0, 1n * a / 2n - (a / 10n)),
        spaghet: (u: UserData, a: bigint) => void addMul(u, 0, 1n * a),
        moon_cake: (u: UserData, a: bigint) => void addMul(u, 0, 2n * a + (a / 4n)),
        avocado: (u: UserData, a: bigint) => void addMul(u, 0, a * 7n + (a / 4n)),
        egg: (u: UserData, a: bigint) => void addMul(u, 0, 500_000n),
        milk: (u: UserData, a: bigint) => void addMul(u, 1, 1n * a),
        venezuela_flag: (u: UserData, a: bigint) => {
            if (u.progression < Progression.VenezuelaMode) u.progression = Progression.VenezuelaMode
            u.vzMode = true
        },
        car: (u: UserData, a: bigint) => {
            u.workBonus += a + (a / 2n)
            u.taxevasion = 1
        }
    }
}