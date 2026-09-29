"use client"

import { AtSignIcon, UploadIcon, XIcon } from "lucide-react"
import { useRef, useState } from "react"

import { AccountTabs } from "@/components/account/account-tabs"
import { CrumbHeader } from "@/components/shared/page-header"
import { PersonAvatar } from "@/components/shared/person-avatar"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import {
  DIGEST_CADENCES,
  LANGUAGES,
  PHONE_COUNTRIES,
  PROFILE_LANDING,
  PROFILE_ROLES,
  TIME_ZONES,
} from "@/data/account"
import { CURRENT_USER } from "@/data/workspace"
import { isEmail } from "@/lib/settings"

type Details = {
  name: string
  email: string
  phoneCountry: string
  phone: string
  username: string
  role: string
  timezone: string
  website: string
  bio: string
}
const SAVED: Details = {
  name: CURRENT_USER.name,
  email: CURRENT_USER.email,
  phoneCountry: CURRENT_USER.phoneCountry,
  phone: CURRENT_USER.phone,
  username: CURRENT_USER.username,
  role: CURRENT_USER.role,
  timezone: CURRENT_USER.timezone,
  website: CURRENT_USER.website,
  bio: CURRENT_USER.bio,
}

/** A row of the profile card: its label and hint on the left, the control on the right (stacked on a phone) */
function Row({
  label,
  hint,
  htmlFor,
  badge,
  children,
}: {
  label: string
  hint?: string
  htmlFor?: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-3 border-b p-4 last:border-b-0 @2xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] @2xl:gap-6">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-sm font-medium">
          {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : label}
          {badge}
        </span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="min-w-0 @2xl:max-w-md">{children}</div>
    </div>
  )
}

/** Account → Profile: Tessa's details and how the workspace behaves for her */
export function Profile() {
  const [d, setD] = useState<Details>(SAVED)
  const [saved, setSaved] = useState<Details>(SAVED)
  const [photo, setPhoto] = useState<string | null>(null)
  const [removed, setRemoved] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const set = <K extends keyof Details>(k: K, v: Details[K]) =>
    setD((x) => ({ ...x, [k]: v }))
  const country =
    PHONE_COUNTRIES.find((c) => c.value === d.phoneCountry) ??
    PHONE_COUNTRIES[0]!
  const emailError = !isEmail(d.email)
  const dirty = JSON.stringify(d) !== JSON.stringify(saved)

  return (
    <>
      <CrumbHeader page="Profile" />
      <div className="@container mx-auto flex w-full max-w-7xl flex-col gap-5 text-foreground">
        <h1 className="sr-only">Profile</h1>
        <AccountTabs />
        <Frame>
          <FrameHeader>
            <FrameTitle className="font-semibold">Profile Details</FrameTitle>
            <FrameDescription>Personal account info.</FrameDescription>
          </FrameHeader>
          <FramePanel className="p-0">
            <Row label="Profile Photo" hint="Shown in comments and mentions.">
              <div className="flex items-center gap-2">
                {photo ? (
                  <Avatar className="size-9">
                    <AvatarImage src={photo} alt="" />
                  </Avatar>
                ) : (
                  <PersonAvatar
                    name={removed ? "Tessa C" : d.name}
                    className="size-9"
                  />
                )}
                <input
                  ref={file}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    setPhoto(URL.createObjectURL(f))
                    setRemoved(false)
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => file.current?.click()}
                >
                  <UploadIcon aria-hidden data-icon="inline-start" />
                  Change
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPhoto(null)
                    setRemoved(true)
                  }}
                >
                  <XIcon aria-hidden data-icon="inline-start" />
                  Remove
                </Button>
              </div>
            </Row>
            <Row
              label="Full Name"
              hint="Used across Knock."
              htmlFor="profile-name"
            >
              <Input
                id="profile-name"
                value={d.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Row>
            <Row
              label="Email Address"
              hint="Primary sign-in email."
              htmlFor="profile-email"
              badge={
                CURRENT_USER.emailVerified && d.email === saved.email ? (
                  <Badge variant="success-light">Verified</Badge>
                ) : undefined
              }
            >
              <Input
                id="profile-email"
                type="email"
                value={d.email}
                aria-invalid={emailError}
                onChange={(e) => set("email", e.target.value)}
              />
            </Row>
            <Row
              label="Phone Number"
              hint="Recovery and urgent alerts."
              htmlFor="profile-phone"
            >
              <InputGroup>
                <InputGroupAddon className="ps-1">
                  <Select
                    items={PHONE_COUNTRIES.map((c) => ({
                      value: c.value,
                      label: `${c.flag} ${c.value}`,
                    }))}
                    value={d.phoneCountry}
                    onValueChange={(v) => v && set("phoneCountry", v)}
                  >
                    <SelectTrigger
                      size="sm"
                      aria-label="Country"
                      className="h-6 border-0 bg-transparent px-1.5 shadow-none"
                    >
                      <span aria-hidden>{country.flag}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {PHONE_COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <span aria-hidden>{c.flag}</span>
                          {c.value} ({c.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </InputGroupAddon>
                <InputGroupInput
                  id="profile-phone"
                  type="tel"
                  inputMode="tel"
                  value={d.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </InputGroup>
            </Row>
            <Row
              label="Username"
              hint="Used in mentions and links."
              htmlFor="profile-username"
            >
              <InputGroup>
                <InputGroupAddon>
                  <AtSignIcon aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  id="profile-username"
                  value={d.username}
                  onChange={(e) =>
                    set("username", e.target.value.replace(/[^a-z0-9._]/gi, ""))
                  }
                />
              </InputGroup>
            </Row>
            <Row label="Public Details" hint="Shown across Knock.">
              <div className="flex flex-col gap-4">
                <Field>
                  <FieldLabel htmlFor="profile-role">Role</FieldLabel>
                  <Select
                    items={PROFILE_ROLES.map((r) => ({ value: r, label: r }))}
                    value={d.role}
                    onValueChange={(v) => v && set("role", v)}
                  >
                    <SelectTrigger id="profile-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFILE_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="profile-timezone">Time zone</FieldLabel>
                  <Select
                    items={TIME_ZONES.map((t) => ({ value: t, label: t }))}
                    value={d.timezone}
                    onValueChange={(v) => v && set("timezone", v)}
                  >
                    <SelectTrigger id="profile-timezone" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_ZONES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="profile-website">Website</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>https://</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="profile-website"
                      value={d.website}
                      onChange={(e) => set("website", e.target.value)}
                    />
                  </InputGroup>
                </Field>
              </div>
            </Row>
            <Row
              label="Bio"
              hint="Short profile summary."
              htmlFor="profile-bio"
            >
              <Textarea
                id="profile-bio"
                value={d.bio}
                onChange={(e) => set("bio", e.target.value)}
                className="min-h-20"
              />
            </Row>
          </FramePanel>
          <FrameFooter className="flex-row justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!dirty}
              onClick={() => setD(saved)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!dirty || emailError || !d.name.trim()}
              onClick={() => {
                setSaved(d)
                toast.add({
                  type: "success",
                  title: "Profile saved",
                  description: `${d.name} · ${d.role}`,
                })
              }}
            >
              Save changes
            </Button>
          </FrameFooter>
        </Frame>
        <ProfilePreferences />
      </div>
    </>
  )
}

/** Profile Preferences: the language, the page Knock opens on, the digest and the morning briefing */
function ProfilePreferences() {
  const [language, setLanguage] = useState(CURRENT_USER.language)
  const [landing, setLanding] = useState(CURRENT_USER.landingView)
  const [digest, setDigest] = useState(CURRENT_USER.digestCadence)
  const [briefing, setBriefing] = useState(CURRENT_USER.dailyBriefing)
  const saved = (what: string, value: string) =>
    toast.add({ type: "success", title: `${what} saved`, description: value })
  const pick = (
    id: string,
    label: string,
    options: string[],
    value: string,
    onPick: (v: string) => void
  ) => (
    <Row label={label} htmlFor={id}>
      <Select
        items={options.map((o) => ({ value: o, label: o }))}
        value={value}
        onValueChange={(v) => {
          if (!v) return
          onPick(v)
          saved(label, v)
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Row>
  )
  return (
    <Frame>
      <FrameHeader>
        <FrameTitle className="font-semibold">Profile Preferences</FrameTitle>
        <FrameDescription>Default workspace behavior.</FrameDescription>
      </FrameHeader>
      <FramePanel className="p-0">
        {pick("pref-language", "Language", LANGUAGES, language, setLanguage)}
        {pick(
          "pref-landing",
          "Landing View",
          PROFILE_LANDING,
          landing,
          setLanding
        )}
        {pick(
          "pref-digest",
          "Digest Cadence",
          DIGEST_CADENCES,
          digest,
          setDigest
        )}
        <Row
          label="Daily Briefing"
          hint="Morning recap before the offices' meetings."
          htmlFor="pref-briefing"
        >
          <Switch
            id="pref-briefing"
            checked={briefing}
            onCheckedChange={(on) => {
              setBriefing(on)
              saved("Daily Briefing", on ? "On" : "Off")
            }}
          />
        </Row>
      </FramePanel>
    </Frame>
  )
}
