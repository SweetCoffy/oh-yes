export function abs(number: bigint | number) {
    if (number < 0n) return -number
    return number
}