// Home → Activity Feed's Add follow-up: what's missing, and the line its toast says.

/** The one required field */
export const followUpError = (step: string) =>
  step.trim() ? null : "Enter a next step"

/** "Tomorrow · Julia Serrano · reminder on" */
export const followUpLine = (due: string, owner: string, remind: boolean) =>
  `${due} · ${owner} · reminder ${remind ? "on" : "off"}`
