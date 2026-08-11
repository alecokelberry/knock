// Dates in the season are ISO days ("2026-07-14") read and written in local time. `new Date("2026-07-14")`
// is UTC midnight, the evening before anywhere west of Greenwich, so nothing here goes through it.

/** ISO day → local midnight */
export function localDate(iso: string) {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** Local date → ISO day */
export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

/** ISO day → local time on that day, in hours after midnight (13.5 is 1:30 pm) */
export function dayAt(iso: string, hours: number) {
  return new Date(localDate(iso).getTime() + hours * 60 * 60_000)
}

export function addDays(iso: string, n: number) {
  const d = localDate(iso)
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

const DAY = 24 * 60 * 60_000
/** Whole days from one ISO day to another, negative when `to` is earlier */
export const daysBetween = (from: string, to: string) =>
  Math.round((localDate(to).getTime() - localDate(from).getTime()) / DAY)

const US = "en-US"
/** The app's date and time formats, one place: "Jul 9" · "Wed, Jul 15" · "Jul 9, 2026" · "Tuesday, July 14" · "4:00 PM" */
export const fmt = {
  day: new Intl.DateTimeFormat(US, { month: "short", day: "numeric" }),
  dayWeekday: new Intl.DateTimeFormat(US, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }),
  dayYear: new Intl.DateTimeFormat(US, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  /** "Feb 03, 2025", as the team table prints a joining date */
  dayYearPadded: new Intl.DateTimeFormat(US, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }),
  dayLong: new Intl.DateTimeFormat(US, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }),
  time: new Intl.DateTimeFormat(US, { hour: "numeric", minute: "2-digit" }),
}

/** "Jul 9" from an ISO day; "Wed, Jul 15" with the weekday, for a booking */
export const formatDay = (iso: string, withWeekday = false) =>
  (withWeekday ? fmt.dayWeekday : fmt.day).format(localDate(iso))

/**
 * `n` business days after a moment, at the same time of day (Saturdays and Sundays don't count). A
 * moment on a weekend starts from Monday at 9 am, when the office opens.
 */
export function addBusinessDays(at: Date, n: number) {
  const d = new Date(at)
  const weekend = (x: Date) => x.getDay() === 0 || x.getDay() === 6
  if (weekend(d)) {
    while (weekend(d)) d.setDate(d.getDate() + 1)
    d.setHours(9, 0, 0, 0)
  }
  for (let left = n; left > 0;) {
    d.setDate(d.getDate() + 1)
    if (!weekend(d)) left--
  }
  return d
}

/** The Sunday after a day: when the next weekly client file lands */
export function nextSunday(iso: string) {
  let d = addDays(iso, 1)
  while (localDate(d).getDay() !== 0) d = addDays(d, 1)
  return d
}

/** A span of time the way a queue says it: "36m", "1h 22m", "2d 4h" */
export function formatSpan(ms: number) {
  const m = Math.max(0, Math.round(Math.abs(ms) / 60_000))
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return m % 60 ? `${h}h ${m % 60}m` : `${h}h`
  const d = Math.floor(h / 24)
  return h % 24 ? `${d}d ${h % 24}h` : `${d}d`
}
