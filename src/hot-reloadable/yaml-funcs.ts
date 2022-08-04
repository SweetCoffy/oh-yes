import { UserData } from "../types.js";

export default {
    item: {
        example_item: (u: UserData, amt: bigint) => u.money.points = 0n
    }
}