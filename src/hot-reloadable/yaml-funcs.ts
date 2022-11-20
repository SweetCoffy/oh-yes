import { Progression, UserData } from "../types.js";
import { BigIntFraction, eco, getFracValue, getPartialValue } from "../util.js";
import { ItemType } from "./economy.js";
let { addMul } = eco()

export default {
    item: {
        generic_multiplier: (u: UserData, a: bigint, type: ItemType) => {
            let mulAttr = type.attributes.get("multiplier")
            if (!mulAttr) return [0n, "..."]
            let mul = mulAttr.value as BigIntFraction[]
            for (let i = 0; i < mul.length; i++) {
                let total = getFracValue(mul[i], a);
                addMul(u, i, total);
            }
        },
        venezuela_flag: (u: UserData, a: bigint) => {
            if (u.progression < Progression.VenezuelaMode) u.progression = Progression.VenezuelaMode
            u.vzMode = true
        },
        the_chair: (u: UserData, a: bigint) => {
            if (!u.vzMode) return [0n]
            u.vzMode = false;
            if (u.progression < Progression.PostVenezuela) u.progression = Progression.PostVenezuela
        },
        car: (u: UserData, a: bigint, type: ItemType) => {
            let workAttr = type.attributes.get("workBonus")
            let evasionAttr = type.attributes.get("taxEvasion")
            if (!workAttr || !evasionAttr) return [0n, "..."]
            u.workBonus += getFracValue(workAttr.value as BigIntFraction, a)
            u.taxEvasion = evasionAttr.value as number
        }
    }
}