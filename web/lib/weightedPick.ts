export function weightedPick<T>(
  items: T[],
  weights: number[]
): number {
  const total = weights.reduce((a, b) => a + b, 0)
  const r = Math.random() * total

  let acc = 0
  for (let i = 0; i < items.length; i++) {
    acc += weights[i]
    if (r <= acc) return i
  }

  return items.length - 1
}