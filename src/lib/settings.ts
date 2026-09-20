// Settings → General: the workspace form's rules and what its summary says. Also the email check the settings forms share.

import {
  ACCENTS,
  WORKSPACE_DOMAIN,
  type WorkspaceSettings,
} from "@/data/workspace"

/** A plausible email address: something, an @, a domain with a dot */
export const isEmail = (s: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())

/** The workspace URL field as typed: lower case, letters, digits and hyphens only (the rest is dropped as you type) */
export const subdomainOf = (typed: string) =>
  typed.toLowerCase().replace(/[^a-z0-9-]/g, "")

export type WorkspaceErrors = Partial<
  Record<"name" | "subdomain" | "supportEmail", string>
>

/** The errors on Save workspace */
export function workspaceErrors(
  w: Pick<WorkspaceSettings, "name" | "subdomain" | "supportEmail">
): WorkspaceErrors {
  const e: WorkspaceErrors = {}
  if (!w.name.trim()) e.name = "Enter a workspace name"
  if (!w.subdomain.trim()) e.subdomain = "Enter a workspace URL"
  if (!isEmail(w.supportEmail)) e.supportEmail = "Enter a valid email address"
  return e
}

/** Workspace Summary's "Verified domain" for a saved workspace: vantage.knock.example */
export const verifiedDomain = (subdomain: string) =>
  `${subdomain}.${WORKSPACE_DOMAIN}`

/** Workspace Summary's "Brand posture": "Teal accent" */
export const brandPosture = (accent: string) =>
  `${ACCENTS.find((a) => a.value === accent)?.label ?? "Teal"} accent`
