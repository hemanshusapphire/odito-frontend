"use client"

import { useState } from "react"
import { Lock, Loader2, Eye, EyeOff, ShieldQuestion } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import apiService from "@/lib/apiService"

// Must match the backend's PASSWORD_MIN_LENGTH (config/passwordPolicy.js) —
// there is no shared runtime between the two, so this is the one place the
// number has to be kept in sync by hand. The backend remains the actual
// source of truth: this is only an early, client-side UX check, never
// trusted on its own (see changePasswordValidator.js for the real check).
const PASSWORD_MIN_LENGTH = 8

const EMPTY_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" }

function PasswordField({ id, label, value, onChange, autoComplete, disabled }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

/**
 * Security — Phase 2 scope only: authenticated Change Password (a new
 * endpoint, deliberately separate from the existing OTP-based forgot/reset
 * flow) plus a static Two-Factor Authentication placeholder. Does not touch
 * AuthContext, JWT, or trigger a re-login — the existing token stays valid
 * after a successful change.
 */
export default function SecurityCard() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (field) => (e) => {
    setError(null)
    setSuccess(false)
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.currentPassword) {
      setError("Current password is required.")
      return
    }
    if (!form.newPassword) {
      setError("New password is required.")
      return
    }
    if (form.newPassword.length < PASSWORD_MIN_LENGTH) {
      setError(`New password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.")
      return
    }
    if (form.newPassword === form.currentPassword) {
      setError("New password cannot be the same as your current password.")
      return
    }

    setSaving(true)
    try {
      await apiService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      })
      // Never keep password values in state longer than necessary — clear
      // immediately on success. The existing JWT is untouched; no re-login
      // is triggered.
      setForm(EMPTY_FORM)
      setSuccess(true)
    } catch (err) {
      setError(err.message || "Failed to update password. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-4 w-4 text-muted-foreground" />
          Security
        </CardTitle>
        <CardDescription>Manage your password.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <PasswordField
            id="security-current-password"
            label="Current Password"
            value={form.currentPassword}
            onChange={handleChange("currentPassword")}
            autoComplete="current-password"
            disabled={saving}
          />
          <PasswordField
            id="security-new-password"
            label="New Password"
            value={form.newPassword}
            onChange={handleChange("newPassword")}
            autoComplete="new-password"
            disabled={saving}
          />
          <PasswordField
            id="security-confirm-password"
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            autoComplete="new-password"
            disabled={saving}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-primary">Password updated successfully.</p>}
        </CardContent>

        <CardFooter className="border-t border-border/60 pt-4">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Password"
            )}
          </Button>
        </CardFooter>
      </form>

      <div className="border-t border-border/60" />

      <CardContent className="flex items-center justify-between gap-4 pt-6">
        <div className="flex items-start gap-3">
          <ShieldQuestion className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
          </div>
        </div>
        <Badge variant="secondary">Coming Soon</Badge>
      </CardContent>
    </Card>
  )
}
