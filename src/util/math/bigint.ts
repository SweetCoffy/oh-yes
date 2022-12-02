export function max(...args: bigint[]) {
    if (args.length == 0) return 0n
    let highest: bigint | null = null
    for (let v of args) {
        if (highest == null || v > highest) highest = v
    }
    return highest as bigint;
}
export function min(...args: bigint[]) {
    if (args.length == 0) return 0n
    let lowest: bigint | null = null
    for (let v of args) {
        if (lowest == null || v < lowest) lowest = v
    }
    return lowest as bigint;
}
export function clamp(x: bigint, min: bigint, max: bigint) {
    if (x < min) return min;
    if (x > max) return max;
    return x
}
/**
 * Returns the GCD (Greatest Common Divisor) of `a` and `b`
 */
export function gcd(a: bigint, b: bigint) {
    while (b != 0n) {
        let t = b
        b = a % b
        a = t
    }
    return a
}
/**
 * Returns the LCM (Least Common Multiple) of `a` and `b`
 */
export function lcm(a: bigint, b: bigint) {
    return a * b / gcd(a, b)
}