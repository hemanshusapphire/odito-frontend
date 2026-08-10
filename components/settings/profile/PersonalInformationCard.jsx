"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { User as UserIcon, Loader2, Pencil, X } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import apiService from "@/lib/apiService"

// Browser-native IANA timezone list — matches exactly what the backend
// validates against (Intl.supportedValuesOf('timeZone')), so nothing here
// can ever submit a value the backend would reject.
const TIMEZONES = typeof Intl !== "undefined" && Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : []

// Mirrors the backend's own allow-list (avatarUpload.js) — this is only an
// early, friendly client-side check so an obviously-invalid file never even
// leaves the browser. The backend's own mimetype/extension/decoded-format
// checks remain the real authority; this can never be trusted on its own.
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  phone: "",
  organization: "",
  website: "",
  country: "",
  timezone: "",
  language: "",
}

function formToState(user) {
  return {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    organization: user?.organization || "",
    website: user?.website || "",
    country: user?.country || "",
    timezone: user?.timezone || "",
    language: user?.language || "",
  }
}

function initials(user) {
  return `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase() || "U"
}

// Same local Toast pattern already used elsewhere in this codebase
// (DangerZoneCard.jsx, DeleteProjectDialog.jsx) — there is no shared toast
// component to reuse instead.
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500)
    return () => clearTimeout(id)
  }, [onClose])
  const bg = type === "success" ? "rgba(0,245,160,0.12)" : "rgba(255,56,96,0.12)"
  const border = type === "success" ? "rgba(0,245,160,0.28)" : "rgba(255,56,96,0.28)"
  const color = type === "success" ? "#00f5a0" : "#ff3860"
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 9999,
        background: bg, border: `1px solid ${border}`, color,
        borderRadius: 10, padding: "11px 18px", fontSize: 13, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 8,
        backdropFilter: "blur(8px)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  )
}

/**
 * Personal Information — Personal fields (Phase 1) + Avatar management
 * (Phase 3). Reads the authenticated user straight from AuthContext (no
 * second query, no useProfile()) and, on any change, calls setUser() with
 * the server response so the header/sidebar/this card all stay on the
 * exact same object — see AuthContext's own checkAuth() for the identical
 * pattern.
 */
export default function PersonalInformationCard() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const fileInputRef = useRef(null)
  const previewUrlRef = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarProgress, setAvatarProgress] = useState(0)
  const [avatarError, setAvatarError] = useState(null)
  const [toast, setToast] = useState(null)

  // Resyncs the form whenever AuthContext's user changes out from under it
  // (e.g. a fresh login) — but never while the user is actively editing or
  // right after their own successful save, which already reflects the
  // latest state.
  useEffect(() => {
    setForm(formToState(user))
  }, [user?.id])

  // Revoke any outstanding object URL on unmount — never leak blob memory.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

  const handleChange = (field) => (e) => {
    setSuccess(false)
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleCountryChange = (e) => {
    setSuccess(false)
    setForm((prev) => ({ ...prev, country: e.target.value.toUpperCase().slice(0, 2) }))
  }

  const handleTimezoneChange = (value) => {
    setSuccess(false)
    setForm((prev) => ({ ...prev, timezone: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.")
      return
    }

    setSaving(true)
    try {
      const response = await apiService.updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        organization: form.organization.trim(),
        website: form.website.trim(),
        country: form.country.trim(),
        timezone: form.timezone.trim(),
        language: form.language.trim(),
      })
      // Wholesale replace — the PUT response is the same full shape GET
      // /auth/profile returns, so this is safe and keeps every consumer of
      // AuthContext's user (header, sidebar, this card) in sync instantly.
      setUser(response.data)
      setSuccess(true)
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const clearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    setAvatarPreview(null)
  }

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0]
    // Reset the input so selecting the exact same file again still fires
    // onChange next time.
    e.target.value = ""
    if (!file) return

    setAvatarError(null)

    // Never allow an upload request for an obviously invalid file — checked
    // before any network call. The backend re-validates all of this itself
    // regardless (see avatarUpload.js / authService.js's uploadAvatar).
    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setAvatarError("Please choose a JPEG, PNG, or WEBP image.")
      return
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError("Image must be 2 MB or smaller.")
      return
    }

    // Immediate local preview, before the upload even starts.
    clearPreview()
    const objectUrl = URL.createObjectURL(file)
    previewUrlRef.current = objectUrl
    setAvatarPreview(objectUrl)

    setAvatarBusy(true)
    setAvatarProgress(0)
    try {
      const response = await apiService.uploadAvatar(file, setAvatarProgress)
      setUser(response.data)
      setToast({ message: "Avatar updated successfully.", type: "success" })
      clearPreview()
    } catch (err) {
      clearPreview()
      setAvatarError(err.message || "Failed to upload avatar. Please try again.")
      setToast({ message: err.message || "Failed to upload avatar.", type: "error" })
    } finally {
      setAvatarBusy(false)
      setAvatarProgress(0)
    }
  }

  const handleRemoveAvatar = async () => {
    setAvatarError(null)
    setAvatarBusy(true)
    try {
      const response = await apiService.removeAvatar()
      setUser(response.data)
      clearPreview()
      setToast({ message: "Avatar removed.", type: "success" })
    } catch (err) {
      setAvatarError(err.message || "Failed to remove avatar. Please try again.")
      setToast({ message: err.message || "Failed to remove avatar.", type: "error" })
    } finally {
      setAvatarBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          Personal Information
        </CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <div className="flex items-center gap-4" aria-busy={avatarBusy}>
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarPreview || user?.avatar || undefined} alt="Your avatar" />
              <AvatarFallback className="text-xl">{initials(user)}</AvatarFallback>
            </Avatar>
            {avatarBusy && (
              <div
                className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70"
                aria-hidden="true"
              >
                <Loader2 className="h-6 w-6 animate-spin text-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleAvatarButtonClick}
                disabled={avatarBusy}
                aria-label="Change avatar"
              >
                <Pencil className="h-3.5 w-3.5" />
                {avatarBusy ? `Uploading... ${avatarProgress}%` : "Edit"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-destructive"
                onClick={handleRemoveAvatar}
                disabled={avatarBusy}
                aria-label="Remove avatar"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">JPEG, PNG, or WEBP. Max 2 MB.</p>
            {avatarError && (
              <p className="text-xs text-destructive" role="alert">{avatarError}</p>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarFileSelect}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      </CardContent>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-firstName">First Name</Label>
              <Input
                id="profile-firstName"
                value={form.firstName}
                onChange={handleChange("firstName")}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-lastName">Last Name</Label>
              <Input
                id="profile-lastName"
                value={form.lastName}
                onChange={handleChange("lastName")}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={user?.email || ""} disabled readOnly />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                type="tel"
                placeholder="+1 415 555 2671"
                value={form.phone}
                onChange={handleChange("phone")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-organization">Organization</Label>
              <Input
                id="profile-organization"
                placeholder="Company name"
                value={form.organization}
                onChange={handleChange("organization")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-website">Website</Label>
            <Input
              id="profile-website"
              placeholder="example.com"
              value={form.website}
              onChange={handleChange("website")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="profile-country">Country</Label>
              <Input
                id="profile-country"
                placeholder="US"
                maxLength={2}
                value={form.country}
                onChange={handleCountryChange}
              />
              <p className="text-xs text-muted-foreground">ISO code, e.g. US</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-timezone">Timezone</Label>
              <Select value={form.timezone || undefined} onValueChange={handleTimezoneChange}>
                <SelectTrigger id="profile-timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-language">Language</Label>
              <Input
                id="profile-language"
                placeholder="en"
                value={form.language}
                onChange={handleChange("language")}
              />
              <p className="text-xs text-muted-foreground">e.g. en or en-US</p>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-primary">Profile updated successfully.</p>}
        </CardContent>

        <CardFooter className="border-t border-border/60 pt-4">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>

      {toast && typeof document !== "undefined" && createPortal(
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />,
        document.body
      )}
    </Card>
  )
}
