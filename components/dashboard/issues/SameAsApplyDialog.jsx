"use client"

import { useMemo, useState } from "react"
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandPinterest,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
  IconLock,
  IconWorld,
} from "@tabler/icons-react"
import { SOCIAL_PROFILE_LIMITS, sameAsComparisonKey, validateProfileRows } from "@/lib/socialProfileUrl"
import { OTHER_PLATFORM, SOCIAL_PLATFORMS, groupUrlsByPlatform, platformMismatchWarning } from "@/lib/socialPlatforms"

/**
 * Add social profiles to the Organization schema (`sameAs`) — SITE-WIDE.
 *
 * One labelled field per common network (lib/socialPlatforms.js) plus an
 * "Other / Custom Profile" card. Every field is optional: fill in any
 * combination; Apply needs at least one valid URL. The owner types the real
 * URLs — nothing is pre-filled and nothing here (or in the AI recommendation)
 * ever supplies one.
 *
 * The platform layout is presentation only. What this dialog produces is
 * exactly three flat lists, which is all the backend accepts:
 *   additionalProfiles         normalized URLs to add (platform order, then custom)
 *   removeProfiles             existing ADDITIONAL profiles to remove
 *   expectedAdditionalProfiles the additional profiles shown here (stale check)
 * It never names a WordPress option, meta key, Rank Math field or schema
 * object: storage (Rank Math's `social_additional_profiles`) is decided
 * server-side, and existing additional profiles are merged, never replaced.
 *
 * Profiles Rank Math derives from its own Facebook/Twitter settings are shown
 * as protected: read-only, no remove control. Saved additional profiles appear
 * in the field of the platform they belong to (unknown hosts under Other).
 *
 * Validation here is instant feedback only; the backend repeats every rule. A
 * URL sitting in the "wrong" platform field only gets a non-blocking hint —
 * the URL itself stays authoritative and is never rewritten.
 */

const ICONS = {
  facebook: IconBrandFacebook,
  instagram: IconBrandInstagram,
  linkedin: IconBrandLinkedin,
  x: IconBrandX,
  youtube: IconBrandYoutube,
  tiktok: IconBrandTiktok,
  pinterest: IconBrandPinterest,
  other: IconWorld,
}

const MAX_CUSTOM_ROWS = 5

const styles = {
  heading: { fontSize: 9.5, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  card: { display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: "var(--s2)", border: "1px solid var(--b)", borderRadius: 10, minWidth: 0 },
  cardTitle: { display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "var(--t)" },
  savedRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--t2)", padding: "4px 8px", background: "var(--card, var(--s))", borderRadius: 6, border: "1px solid var(--b)" },
  url: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  tag: { fontSize: 9, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", whiteSpace: "nowrap" },
  linkButton: { background: "none", border: "none", padding: 0, fontSize: 11, fontWeight: 600, cursor: "pointer", color: "var(--t2)", textDecoration: "underline", whiteSpace: "nowrap" },
  input: { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, fontSize: 12.5, color: "var(--t)", background: "var(--card, var(--s))", outline: "none" },
  error: { fontSize: 11, color: "#ff3860" },
  warning: { fontSize: 11, color: "#f5a623" },
}

function UrlInput({ ariaLabel, placeholder, value, onChange, onBlur, disabled, invalid }) {
  return (
    <input
      type="text"
      inputMode="url"
      autoComplete="off"
      spellCheck={false}
      aria-label={ariaLabel}
      aria-invalid={invalid}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      style={{ ...styles.input, border: `1px solid ${invalid ? "#ff3860" : "var(--b)"}` }}
    />
  )
}

// The message under an input: a blocking error (once touched) wins; otherwise a
// non-blocking platform hint for a URL that is valid but may be in the wrong field.
// A duplicate is a problem BETWEEN fields, so it is shown at once: the flagged
// (later) field is often not the one the user just left.
const errorVisible = (result, touched) => !!result && !result.blank && !result.ok && (!!touched || result.code === "DUPLICATE")

function FieldMessage({ result, touched, platformId, isOther }) {
  if (!result || result.blank) return null
  if (!result.ok) {
    return errorVisible(result, touched) ? <div role="alert" style={styles.error}>{result.message}</div> : null
  }
  const warning = isOther ? null : platformMismatchWarning(platformId, result.url)
  return warning ? <div role="status" style={styles.warning}>{warning}</div> : null
}

export default function SameAsApplyDialog({
  open, onOpenChange, siteLabel, providerLabel, organization, organizationLoading, organizationUnavailable,
  unavailableReason, onConfirm, onRefreshLiveValue, isApplying, errorInfo,
}) {
  // Draft state. The dialog is mounted only while open, so it starts fresh each time.
  const [values, setValues] = useState({})
  const [customRows, setCustomRows] = useState([""])
  const [touched, setTouched] = useState({})
  const [removals, setRemovals] = useState(() => new Set())
  const [confirmingRemoval, setConfirmingRemoval] = useState(null)

  const protectedProfiles = useMemo(() => organization?.protectedSameAs || [], [organization])
  const additionalProfiles = useMemo(() => organization?.additionalSameAs || [], [organization])
  const savedByPlatform = useMemo(() => groupUrlsByPlatform(additionalProfiles), [additionalProfiles])
  const protectedByPlatform = useMemo(() => groupUrlsByPlatform(protectedProfiles), [protectedProfiles])

  const existingKeys = useMemo(
    () => new Set([...protectedProfiles, ...additionalProfiles].map(sameAsComparisonKey).filter(Boolean)),
    [protectedProfiles, additionalProfiles]
  )

  // Every input in display order: one per platform, then the custom rows.
  const fields = useMemo(() => [
    ...SOCIAL_PLATFORMS.map((p) => ({ key: p.id, platformId: p.id, raw: values[p.id] || "" })),
    ...customRows.map((raw, i) => ({ key: `other-${i}`, platformId: OTHER_PLATFORM.id, raw, customIndex: i })),
  ], [values, customRows])
  const validation = useMemo(() => validateProfileRows(fields.map((f) => f.raw), { existingKeys }), [fields, existingKeys])
  const resultFor = (key) => validation.rows[fields.findIndex((f) => f.key === key)]

  // A removal only counts while that profile is still in the live list (a
  // refresh after a conflict may have dropped it).
  const effectiveRemovals = additionalProfiles.filter((url) => removals.has(url))

  if (!open) return null

  const unavailable = !!unavailableReason
  const loaded = !organizationLoading && !organizationUnavailable && !unavailable
  const showRefreshAction = !!errorInfo?.requiresRefresh || organizationUnavailable
  const applyDisabledByError = !!errorInfo?.nonRetryable
  const tooMany = validation.urls.length > SOCIAL_PROFILE_LIMITS.maxProfilesPerRequest
  const applyDisabled = isApplying || !loaded || !validation.canApply || applyDisabledByError
  const nothingEntered = validation.rows.every((r) => r.blank)

  const touch = (key) => setTouched((prev) => ({ ...prev, [key]: true }))
  const setPlatformValue = (id, value) => setValues((prev) => ({ ...prev, [id]: value }))
  const setCustomValue = (index, value) => setCustomRows((prev) => prev.map((r, i) => (i === index ? value : r)))
  const removeCustomRow = (index) => {
    setCustomRows((prev) => (prev.length === 1 ? [""] : prev.filter((_, i) => i !== index)))
    setTouched({})
  }
  const toggleRemoval = (url, on) => {
    setRemovals((prev) => {
      const next = new Set(prev)
      if (on) next.add(url)
      else next.delete(url)
      return next
    })
    setConfirmingRemoval(null)
  }

  const handleConfirm = () => {
    if (applyDisabled) return
    onConfirm({
      additionalProfiles: validation.urls,
      removeProfiles: effectiveRemovals,
      expectedAdditionalProfiles: additionalProfiles,
    })
  }

  const summary = validation.urls.length
    ? `Will add ${validation.urls.length} profile${validation.urls.length === 1 ? "" : "s"}${effectiveRemovals.length ? ` and remove ${effectiveRemovals.length}` : ""}.`
    : null

  // Profiles already on the site for one card: protected (read-only) first, then
  // saved additional ones with their remove / confirm / undo controls.
  const renderExisting = (platformId) => (
    <>
      {(protectedByPlatform[platformId] || []).map((url) => (
        <div key={`p-${url}`} style={styles.savedRow} data-testid={`sameas-protected-${platformId}`}>
          <IconLock size={13} aria-hidden="true" />
          <span style={styles.url} title={url}>{url}</span>
          <span style={styles.tag}>Protected by Rank Math</span>
        </div>
      ))}
      {(savedByPlatform[platformId] || []).map((url) => {
        const marked = removals.has(url)
        const confirming = confirmingRemoval === url
        return (
          <div key={`s-${url}`} style={{ ...styles.savedRow, opacity: marked ? 0.7 : 1 }} data-testid={`sameas-saved-${platformId}`}>
            <span style={{ ...styles.url, textDecoration: marked ? "line-through" : "none" }} title={url}>{url}</span>
            {marked ? (
              <>
                <span style={{ ...styles.tag, color: "#f5a623" }}>Will be removed</span>
                <button type="button" style={styles.linkButton} onClick={() => toggleRemoval(url, false)} disabled={isApplying} aria-label={`Keep ${url}`}>Undo</button>
              </>
            ) : confirming ? (
              <>
                <span style={{ fontSize: 11, color: "#f5a623" }}>Remove from your website?</span>
                <button type="button" style={{ ...styles.linkButton, color: "#ff3860" }} onClick={() => toggleRemoval(url, true)} aria-label={`Confirm remove ${url}`}>Remove</button>
                <button type="button" style={styles.linkButton} onClick={() => setConfirmingRemoval(null)}>Keep</button>
              </>
            ) : (
              <>
                <span style={styles.tag}>Saved</span>
                <button type="button" style={styles.linkButton} onClick={() => setConfirmingRemoval(url)} disabled={isApplying} aria-label={`Remove ${url}`}>Remove</button>
              </>
            )}
          </div>
        )
      })}
    </>
  )

  const cardTitle = (id, label) => {
    const Icon = ICONS[id]
    return (
      <div style={styles.cardTitle}>
        <Icon size={16} aria-hidden="true" />
        <span>{label}</span>
      </div>
    )
  }

  const hasAnyExisting = protectedProfiles.length + additionalProfiles.length > 0

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
      <div
        role="dialog"
        aria-label="Add social profiles to Organization schema"
        style={{ width: "min(680px, 94vw)", maxHeight: "92vh", overflowY: "auto", background: "var(--card, var(--s))", border: "1px solid var(--b)", borderRadius: 14, padding: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t)", marginBottom: 4 }}>Add Social Profiles to Organization Schema?</div>
        <div style={{ fontSize: 11.5, color: "var(--t3)", marginBottom: 4 }}>
          {siteLabel ? `Website: ${siteLabel}` : null}{providerLabel ? ` · Provider: ${providerLabel}` : null} · Scope: SITE-WIDE
        </div>
        <div style={{ fontSize: 11, color: "#f5a623", marginBottom: 14, lineHeight: 1.4 }}>
          This is a SITE-WIDE change — it affects Organization schema on every page, not just this one.
        </div>

        {unavailable ? (
          <div role="alert" style={{ fontSize: 12, color: "#f5a623", padding: "10px 12px", background: "rgba(245,166,35,0.1)", borderRadius: 8, marginBottom: 14, lineHeight: 1.5 }}>
            {unavailableReason}
          </div>
        ) : organizationLoading ? (
          <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 14 }}>Loading current profiles…</div>
        ) : organizationUnavailable ? (
          <div role="alert" style={{ fontSize: 12, color: "#ff3860", marginBottom: 14 }}>Unable to read the current profiles. Refresh and try again.</div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div style={{ ...styles.heading, color: "#00f5a0" }}>Social profiles</div>
            <div style={{ fontSize: 11.5, color: "var(--t2)", marginBottom: 10, lineHeight: 1.5 }}>
              {nothingEntered
                ? "Add your verified social profile URLs below. All fields are optional — fill in only the profiles you actually have. Odito never guesses these."
                : "All fields are optional — leave empty any profile you don't have."}
              {!hasAnyExisting && " No social profiles are configured on your site yet."}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10 }}>
              {SOCIAL_PLATFORMS.map((platform) => {
                const result = resultFor(platform.id)
                const showError = errorVisible(result, touched[platform.id])
                return (
                  <div key={platform.id} style={styles.card} data-testid={`sameas-card-${platform.id}`}>
                    {cardTitle(platform.id, platform.label)}
                    {renderExisting(platform.id)}
                    <UrlInput
                      ariaLabel={`${platform.label} profile URL`}
                      placeholder={platform.placeholder}
                      value={values[platform.id] || ""}
                      onChange={(v) => setPlatformValue(platform.id, v)}
                      onBlur={() => touch(platform.id)}
                      disabled={isApplying}
                      invalid={showError}
                    />
                    <FieldMessage result={result} touched={!!touched[platform.id]} platformId={platform.id} />
                  </div>
                )
              })}

              <div style={{ ...styles.card, gridColumn: "1 / -1" }} data-testid="sameas-card-other">
                {cardTitle(OTHER_PLATFORM.id, OTHER_PLATFORM.label)}
                {renderExisting(OTHER_PLATFORM.id)}
                {customRows.map((value, index) => {
                  const key = `other-${index}`
                  const result = resultFor(key)
                  const showError = errorVisible(result, touched[key])
                  return (
                    <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <UrlInput
                            ariaLabel={`Other profile URL ${index + 1}`}
                            placeholder={OTHER_PLATFORM.placeholder}
                            value={value}
                            onChange={(v) => setCustomValue(index, v)}
                            onBlur={() => touch(key)}
                            disabled={isApplying}
                            invalid={showError}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCustomRow(index)}
                          disabled={isApplying || (customRows.length === 1 && !value)}
                          aria-label={`Remove other profile row ${index + 1}`}
                          style={styles.linkButton}
                        >
                          Remove
                        </button>
                      </div>
                      <FieldMessage result={result} touched={!!touched[key]} platformId={OTHER_PLATFORM.id} isOther />
                    </div>
                  )
                })}
                <div>
                  <button
                    type="button"
                    onClick={() => setCustomRows((prev) => [...prev, ""])}
                    disabled={isApplying || customRows.length >= MAX_CUSTOM_ROWS}
                    style={styles.linkButton}
                  >
                    + Add another profile
                  </button>
                </div>
              </div>
            </div>

            {tooMany && (
              <div role="alert" style={{ ...styles.error, marginTop: 8 }}>
                You can add at most {SOCIAL_PROFILE_LIMITS.maxProfilesPerRequest} profiles at a time.
              </div>
            )}
          </div>
        )}

        {summary && <div data-testid="sameas-summary" style={{ fontSize: 11.5, color: "var(--t2)", marginBottom: 10 }}>{summary}</div>}

        {errorInfo && (
          <div role="alert" style={{
            fontSize: 11.5, lineHeight: 1.5, marginBottom: 12, padding: "8px 10px", borderRadius: 8,
            color: errorInfo.isConflict || errorInfo.partialWrite ? "#f5a623" : "#ff3860",
            background: errorInfo.isConflict || errorInfo.partialWrite ? "rgba(245,166,35,0.1)" : "rgba(255,56,96,0.08)",
          }}>
            {errorInfo.wordpressWriteSucceeded
              ? "The WordPress change may have already been applied, but Odito couldn't record it because the task changed at the same time. Refresh and check WordPress before trying again."
              : errorInfo.partialWrite
                ? `${errorInfo.message} Some profiles may already have been saved to WordPress — refresh to see the current list before trying again.`
                : errorInfo.isConflict
                  ? (errorInfo.message || "The social profiles on WordPress changed before this fix was applied. Refresh and review before applying again.")
                  : errorInfo.message}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => onOpenChange(false)} disabled={isApplying}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: "1px solid var(--b)", background: "var(--s2)", color: "var(--t2)", cursor: isApplying ? "not-allowed" : "pointer" }}>
            Cancel
          </button>
          {showRefreshAction ? (
            <button type="button" onClick={onRefreshLiveValue} disabled={organizationLoading}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: "none", background: "#f5a623", color: "#1a1a1a", cursor: organizationLoading ? "not-allowed" : "pointer", opacity: organizationLoading ? 0.7 : 1 }}>
              {organizationLoading ? "Refreshing…" : "Refresh Live Value"}
            </button>
          ) : (
            <button type="button" onClick={handleConfirm} disabled={applyDisabled}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: "none", background: "linear-gradient(135deg,#7730ed,#00dfff)", color: "#fff", cursor: applyDisabled ? "not-allowed" : "pointer", opacity: applyDisabled ? 0.5 : 1 }}>
              {isApplying ? "Applying…" : "Apply via WordPress"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
