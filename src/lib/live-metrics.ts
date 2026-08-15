// The live metrics' arithmetic: a reading that wanders, and the sparkline drawn from the last twenty.

export type Bounds = { min: number; max: number }

/** How many readings a sparkline shows */
export const SPARK_POINTS = 20

/** The next reading: a step of up to a third of the range either way (the lines jump), kept inside it, to one decimal */
export function nextReading(
  value: number,
  { min, max }: Bounds,
  random: () => number = Math.random
): number {
  const step = (random() - 0.5) * (((max - min) * 2) / 3)
  return Math.round(Math.min(max, Math.max(min, value + step)) * 10) / 10
}

/** Twenty readings leading up to `start`, walking back from it, so the line has a history on the first paint */
export function seedReadings(
  start: number,
  bounds: Bounds,
  random: () => number = Math.random
): number[] {
  const out = [start]
  while (out.length < SPARK_POINTS)
    out.unshift(nextReading(out[0] ?? start, bounds, random))
  return out
}

/**
 * The sparkline's line and area in a `w`×`h` box: each reading a point, joined by curves that leave and
 * arrive level (control points at the midpoint's x); scaled to the series' own range with
 * a pixel of air above and below.
 */
export function sparkline(
  values: number[],
  w = 48,
  h = 20
): { line: string; area: string } {
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const span = hi - lo || 1
  const dx = w / Math.max(1, values.length - 1)
  const y = (v: number) => 1 + (1 - (v - lo) / span) * (h - 2)
  let line = ""
  values.forEach((v, i) => {
    if (i === 0) {
      line = `M 0 ${y(v)}`
      return
    }
    const x0 = (i - 1) * dx
    const x1 = i * dx
    const mid = (x0 + x1) / 2
    line += ` C ${mid} ${y(values[i - 1] ?? v)}, ${mid} ${y(v)}, ${x1} ${y(v)}`
  })
  return { line, area: `${line} L ${w} ${h} L 0 ${h} Z` }
}

/** A repeatable random sequence (mulberry32), so the history drawn on the server and in the browser agree */
export function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
