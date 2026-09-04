import { describe, expect, it } from "vitest"

import { csvField, toCsv } from "./csv"

describe("csv", () => {
  it("quotes fields that need it", () => {
    expect(csvField("plain")).toBe("plain")
    expect(csvField("a, b")).toBe('"a, b"')
    expect(csvField('say "hi"')).toBe('"say ""hi"""')
  })
  it("joins rows with CRLF", () => {
    expect(
      toCsv([
        ["a", 1],
        ["b", 2],
      ])
    ).toBe("a,1\r\nb,2\r\n")
  })
})
