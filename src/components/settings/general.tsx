"use client"

import { ImageIcon, UploadIcon, XIcon } from "lucide-react"
import { useRef, useState } from "react"

import { CrumbHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldTitle,
} from "@/components/ui/field"
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import {
  ACCENTS,
  DATA_REGION,
  LANDING_VIEWS,
  type LandingView,
  WORKSPACE_DOMAIN,
  WORKSPACE_SETTINGS,
  type WorkspaceSettings,
} from "@/data/workspace"
import {
  brandPosture,
  subdomainOf,
  verifiedDomain,
  workspaceErrors,
} from "@/lib/settings"

/** The logo: a teal-to-indigo square */
const DEFAULT_LOGO =
  "linear-gradient(60deg, #25a6b4 0%, #2a7fb0 38%, #2c4a98 72%, #2b3585 100%)"

/** Settings → General: the workspace's brand and contact details, its defaults, and a summary */
export function GeneralSettings() {
  // What Save workspace last saved: the summary reads it and follows each save
  const [saved, setSaved] = useState<WorkspaceSettings>(WORKSPACE_SETTINGS)
  return (
    <>
      <CrumbHeader page="Settings" />
      <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Settings</h1>
        <section aria-label="Workspace">
          <div className="flex flex-col gap-5">
            <DetailsCard
              saved={saved}
              onSave={(w) => setSaved((s) => ({ ...s, ...w }))}
            />
            <PreferencesCard
              onChange={(p) => setSaved((s) => ({ ...s, ...p }))}
            />
            <SummaryCard saved={saved} />
          </div>
        </section>
      </div>
    </>
  )
}

/** One row of a settings card: label and description on the left, the control on the right (stacked on a phone) */
function Row({
  label,
  htmlFor,
  description,
  narrow,
  children,
}: {
  label: string
  htmlFor?: string
  description?: string
  narrow?: boolean
  children: React.ReactNode
}) {
  return (
    <Field orientation="responsive" className="gap-4 px-5 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 @md/field-group:max-w-sm">
        <div className="flex flex-wrap items-center gap-2">
          {htmlFor ? (
            <FieldLabel htmlFor={htmlFor} className="capitalize">
              {label}
            </FieldLabel>
          ) : (
            <FieldTitle
              id={`${label.toLowerCase().replace(/\W+/g, "-")}-label`}
              className="capitalize"
            >
              {label}
            </FieldTitle>
          )}
        </div>
        {description && (
          <FieldDescription className="leading-5">
            {description}
          </FieldDescription>
        )}
      </div>
      <FieldContent
        className={
          narrow
            ? "w-full min-w-0 @md/field-group:max-w-[17rem] @md/field-group:flex-1 @md/field-group:shrink-0"
            : "w-full min-w-0 @md/field-group:max-w-[34rem] @md/field-group:flex-1"
        }
      >
        <div className="flex w-full justify-start @md/field-group:justify-end">
          {children}
        </div>
      </FieldContent>
    </Field>
  )
}

function DetailsCard({
  saved,
  onSave,
}: {
  saved: WorkspaceSettings
  onSave: (
    w: Pick<WorkspaceSettings, "name" | "subdomain" | "supportEmail" | "accent">
  ) => void
}) {
  const [name, setName] = useState(saved.name)
  const [subdomain, setSubdomain] = useState(saved.subdomain)
  const [supportEmail, setSupportEmail] = useState(saved.supportEmail)
  const [accent, setAccent] = useState(saved.accent)
  // The logo: the gradient, a picture picked with Change (read in the browser, never uploaded), or none
  const [logo, setLogo] = useState<string | null>(DEFAULT_LOGO)
  const [submitted, setSubmitted] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const errors = submitted
    ? workspaceErrors({ name, subdomain, supportEmail })
    : {}

  const pickLogo = (f: File | undefined) => {
    if (!f) return
    const reader = new FileReader()
    reader.addEventListener("load", () =>
      setLogo(`url("${reader.result as string}")`)
    )
    reader.readAsDataURL(f)
  }
  const save = () => {
    setSubmitted(true)
    if (Object.keys(workspaceErrors({ name, subdomain, supportEmail })).length)
      return
    onSave({
      name: name.trim(),
      subdomain,
      supportEmail: supportEmail.trim(),
      accent,
    })
    toast.add({
      type: "success",
      title: "Workspace saved",
      description: "Your changes are live.",
    })
  }

  return (
    <Frame spacing="sm">
      <FrameHeader>
        <FrameTitle className="capitalize">Workspace details</FrameTitle>
        <FrameDescription>Brand and contact info.</FrameDescription>
      </FrameHeader>
      <FramePanel className="p-0!">
        <FieldGroup className="gap-0">
          <Row
            label="Workspace logo"
            htmlFor="workspace-logo"
            description="Used in navigation and shared links."
          >
            <div className="flex grow flex-wrap items-center justify-start gap-2">
              <div className="relative">
                {logo ? (
                  <span
                    role="img"
                    aria-label="Workspace logo"
                    className="block size-10 rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: logo }}
                  />
                ) : (
                  <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <ImageIcon aria-hidden className="size-4" />
                  </span>
                )}
              </div>
              <div className="relative inline-flex">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => file.current?.click()}
                >
                  <UploadIcon aria-hidden data-icon="inline-start" />
                  {logo ? "Change" : "Upload"}
                </Button>
                <input
                  ref={file}
                  id="workspace-logo"
                  type="file"
                  accept="image/*"
                  aria-label="Upload workspace logo"
                  tabIndex={-1}
                  className="sr-only"
                  onChange={(e) => {
                    pickLogo(e.target.files?.[0])
                    e.target.value = ""
                  }}
                />
              </div>
              {logo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogo(null)}
                >
                  <XIcon aria-hidden data-icon="inline-start" />
                  Remove
                </Button>
              )}
            </div>
          </Row>
          <FieldSeparator />
          <Row label="Workspace name" htmlFor="workspace-name">
            <Field className="w-full" data-invalid={!!errors.name || undefined}>
              <Input
                id="workspace-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                className="max-md:text-base"
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>
          </Row>
          <FieldSeparator />
          <Row
            label="Workspace URL"
            htmlFor="workspace-subdomain"
            description="Link for teammates and clients."
          >
            <Field
              className="w-full"
              data-invalid={!!errors.subdomain || undefined}
            >
              <InputGroup className="h-7 w-full">
                <InputGroupInput
                  id="workspace-subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(subdomainOf(e.target.value))}
                  aria-invalid={!!errors.subdomain}
                  autoCapitalize="none"
                  spellCheck={false}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>.{WORKSPACE_DOMAIN}</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {errors.subdomain && <FieldError>{errors.subdomain}</FieldError>}
            </Field>
          </Row>
          <FieldSeparator />
          <Row
            label="Support email"
            htmlFor="workspace-support-email"
            description="Shown on help surfaces."
          >
            <Field
              className="w-full"
              data-invalid={!!errors.supportEmail || undefined}
            >
              <Input
                id="workspace-support-email"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                aria-invalid={!!errors.supportEmail}
                className="max-md:text-base"
              />
              {errors.supportEmail && (
                <FieldError>{errors.supportEmail}</FieldError>
              )}
            </Field>
          </Row>
          <FieldSeparator />
          <Row
            label="Accent color"
            description="Used for highlights and links. Select one accent."
            narrow
          >
            <div
              role="radiogroup"
              aria-label="Accent color"
              className="flex flex-wrap items-center gap-2"
            >
              {ACCENTS.map((a) => (
                <label key={a.value} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="workspace-accent"
                    value={a.value}
                    aria-label={a.label}
                    checked={accent === a.value}
                    onChange={() => setAccent(a.value)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    style={{ backgroundColor: a.hex }}
                    className="flex size-6 items-center justify-center rounded-full border border-white/80 shadow-sm ring-offset-2 ring-offset-background transition-[box-shadow] peer-checked:ring-2 peer-checked:ring-foreground/70 peer-focus-visible:ring-2 peer-focus-visible:ring-foreground/70 hover:ring-2 hover:ring-foreground/20 max-md:size-7"
                  />
                </label>
              ))}
            </div>
          </Row>
        </FieldGroup>
      </FramePanel>
      <FrameFooter className="flex-row justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // The brand it previews is the accent picked here
            toast.add({
              type: "info",
              title: "Preview brand",
              description: "Opening a preview of your brand.",
            })
          }}
        >
          Preview brand
        </Button>
        <Button size="sm" onClick={save}>
          Save workspace
        </Button>
      </FrameFooter>
    </Frame>
  )
}

function PreferencesCard({
  onChange,
}: {
  onChange: (p: Partial<WorkspaceSettings>) => void
}) {
  const [landing, setLanding] = useState<LandingView>(
    WORKSPACE_SETTINGS.landingView
  )
  const [sharing, setSharing] = useState(WORKSPACE_SETTINGS.externalSharing)
  const [recaps, setRecaps] = useState(WORKSPACE_SETTINGS.aiRecaps)
  return (
    <Frame spacing="sm">
      <FrameHeader>
        <FrameTitle className="capitalize">Workspace preferences</FrameTitle>
        <FrameDescription>Sharing and automation defaults.</FrameDescription>
      </FrameHeader>
      <FramePanel className="p-0!">
        <FieldGroup className="gap-0">
          <Row label="Default landing view" narrow>
            <Field className="w-full">
              <Select
                items={LANDING_VIEWS.map((v) => ({
                  value: v.value,
                  label: v.label,
                }))}
                value={landing}
                onValueChange={(v) => {
                  if (!v) return
                  setLanding(v)
                  onChange({ landingView: v })
                }}
              >
                <SelectTrigger
                  id="workspace-landing-view"
                  aria-labelledby="default-landing-view-label"
                  className="w-full max-md:h-9 max-md:text-base"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANDING_VIEWS.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      <div className="flex flex-col">
                        <span>{v.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {v.hint}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </Row>
          <FieldSeparator />
          <SwitchRow
            id="workspace-external-sharing"
            label="External sharing"
            description="Create client-safe links."
            checked={sharing}
            onChange={(v) => {
              setSharing(v)
              onChange({ externalSharing: v })
            }}
          />
          <FieldSeparator />
          <SwitchRow
            id="workspace-ai-recaps"
            label="AI deal recaps"
            description="Short recaps as deals move stage."
            checked={recaps}
            onChange={(v) => {
              setRecaps(v)
              onChange({ aiRecaps: v })
            }}
          />
        </FieldGroup>
      </FramePanel>
    </Frame>
  )
}

function SwitchRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <Row label={label} htmlFor={id} description={description} narrow>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </Row>
  )
}

function SummaryCard({ saved }: { saved: WorkspaceSettings }) {
  const rows = [
    {
      label: "Verified domain",
      value: verifiedDomain(saved.subdomain),
      note: "Deal links, invites, and shared reports resolve here.",
      badge: "Active",
    },
    { ...DATA_REGION, badge: null },
    {
      label: "Brand posture",
      value: brandPosture(saved.accent),
      note: "Applied to shared quotes and workspace navigation.",
      badge: null,
    },
  ]
  return (
    <Frame spacing="sm">
      <FrameHeader>
        <FrameTitle className="capitalize">Workspace summary</FrameTitle>
        <FrameDescription>Brand, routing, and region.</FrameDescription>
      </FrameHeader>
      <FramePanel className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          {rows.map((r, i) => (
            <div key={r.label} className="flex flex-col gap-3">
              {i > 0 && <Separator />}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{r.label}</p>
                  <p className="mt-1 text-sm font-medium">{r.value}</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {r.note}
                  </p>
                </div>
                {r.badge && <Badge variant="success-light">{r.badge}</Badge>}
              </div>
            </div>
          ))}
        </div>
      </FramePanel>
    </Frame>
  )
}
