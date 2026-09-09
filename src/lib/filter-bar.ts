// The filter bar the tables share: rules of field, operator and value(s), and whether a row passes them.

export type FilterBarFieldType = "text" | "select"
export type FilterBarRule = {
  id: string
  field: string
  operator: string
  values: string[]
}

/** Operators per kind of field */
export const FILTER_OPERATORS: Record<
  FilterBarFieldType,
  { value: string; label: string; takesValue?: false; linkOnly?: true }[]
> = {
  text: [
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "does not contain" },
    { value: "starts_with", label: "starts with" },
    { value: "ends_with", label: "ends with" },
    { value: "is", label: "is exactly" },
    { value: "empty", label: "is empty", takesValue: false },
    { value: "not_empty", label: "is not empty", takesValue: false },
  ],
  select: [
    { value: "is", label: "is" },
    { value: "is_not", label: "is not" },
    { value: "empty", label: "is empty", takesValue: false },
    { value: "not_empty", label: "is not empty", takesValue: false },
    // A rule a link opens with (?lifecycle= and ?territory=): named so, but not offered in the menu
    { value: "is_any_of", label: "is any of", linkOnly: true },
  ],
}

/** Whether a row passes every rule; `get` reads a field's text off the row. A rule without a value yet passes. */
export function passesFilters<T>(
  row: T,
  rules: FilterBarRule[],
  get: (row: T, field: string) => string
): boolean {
  return rules.every((r) => {
    const value = get(row, r.field).toLowerCase()
    const wanted = r.values.map((v) => v.toLowerCase()).filter(Boolean)
    switch (r.operator) {
      case "empty":
        return !value
      case "not_empty":
        return !!value
    }
    const [first] = wanted
    if (first === undefined) return true
    switch (r.operator) {
      case "contains":
        return value.includes(first)
      case "not_contains":
        return !value.includes(first)
      case "starts_with":
        return value.startsWith(first)
      case "ends_with":
        return value.endsWith(first)
      case "is":
      case "is_any_of":
        return wanted.includes(value)
      case "is_not":
        return !wanted.includes(value)
      default:
        return true
    }
  })
}

/** Whether the rules narrow anything (a blank search box doesn't) */
export const filtersActive = (rules: FilterBarRule[]) =>
  rules.some(
    (r) =>
      r.values.some(Boolean) ||
      r.operator === "empty" ||
      r.operator === "not_empty"
  )
