// CSV for the pages' Export buttons: building the text, and handing it to the browser when the toast's Download is tapped.

/** One CSV field: quoted when it holds a comma, quote or line break, with quotes doubled. */
export function csvField(value: string | number): string {
  const s = String(value)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(rows: (string | number)[][]): string {
  return `${rows.map((r) => r.map(csvField).join(",")).join("\r\n")}\r\n`
}

/** Saves a CSV through the browser's own download (only ever from a tap on an Export toast's Download) */
export function downloadCsv(name: string, csv: string) {
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  )
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
