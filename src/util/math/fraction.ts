import { gcd, lcm } from "./bigint.js";

export type BigIntFraction = [bigint, bigint]
export function simplifyFrac([a, b]: BigIntFraction): BigIntFraction {
    let g = gcd(a, b)
    return [a / g, b / g]
}
export function getFracValue([a, b]: BigIntFraction, x: bigint = 1n) {
    return a * x / b
}
export function addFracs(...fracs: BigIntFraction[]) {
    if (fracs.length == 1) return fracs[0]
    if (fracs.length == 2) {
        let [a, b] = fracs;
        return simplifyFrac([a[0] * b[1] + b[0] * a[1], a[1] * b[1]])
    }
    // If it works, it works.
    let fr = [0n, 1n] as BigIntFraction
    for (let frac of fracs) {
        fr = addFracs(fr, frac)
    }
    return simplifyFrac(fr);
}
export function lcmArray(...args: bigint[]) {
    if (args.length < 2) return args[0] ?? 0n
    let v = lcm(args.shift() as bigint, args.shift() as bigint)
    for (let n of args) {
        v = lcm(v, n)
    }
    return v;
}