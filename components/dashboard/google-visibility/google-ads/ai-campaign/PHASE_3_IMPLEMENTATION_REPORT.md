# AI Campaign Builder — Phase 3: Frontend

**Status:** Complete. The full production workflow — Google Ads page →
Create Campaign → brief → generate (Phase 2 API) → editable workspace →
Save Draft — is implemented against the real Phase 1/2 backend. No mock
campaign data. No Claude call from the browser. No Google Ads publishing.
No conversational AI editing.

---

## 1. Files created

### Routes (App Router, under the existing Google Ads area)
| File | Purpose |
| --- | --- |
| `app/app/google-visibility/google-ads/ai-campaigns/page.jsx` | Drafts list — "continue editing later" (spec §12), delete (draft/failed only), empty state |
| `app/app/google-visibility/google-ads/ai-campaigns/new/page.jsx` | Setup → generation state machine (`setup` → `generating` → `workspace` \| `error`) |
| `app/app/google-visibility/google-ads/ai-campaigns/[draftId]/page.jsx` | Workspace container — loads the draft, wires save |

### Components (`components/dashboard/google-visibility/google-ads/ai-campaign/`)
| File | Responsibility |
| --- | --- |
| `CreateCampaignMenu.jsx` | Entry-point dropdown on the Google Ads header (AI Campaign / Continue a draft / Manual campaign → Google Ads) |
| `AiCampaignSetupForm.jsx` | Campaign brief form (controlled state, client validation) |
| `AiCampaignGenerationState.jsx` | Indeterminate generation UX with labelled stages (no fake %) |
| `AiCampaignErrorState.jsx` | Friendly failure panel (preserved-draft aware) |
| `AiCampaignWorkspace.jsx` | Workspace orchestrator — section rail, reducer state, dirty guard, save bar |
| `CampaignOverviewCard.jsx` | Read-only campaign summary + "Odito draft, not published" marker |
| `CampaignSettingsForm.jsx` | Editable campaign settings (name, goal, budget, currency, bidding, language, location) |
| `AdGroupEditor.jsx` | One ad group — name + keywords + negatives + ads (memoized, isolation comparator) |
| `KeywordEditorTable.jsx` | Keyword / negative-keyword list editor (memoized, duplicate flagging) |
| `ResponsiveSearchAdEditor.jsx` | RSA editor — headlines / descriptions (char counters), final URL, paths (memoized) |
| `CampaignSaveBar.jsx` | Sticky save bar — dirty / saving / saved / error state |
| `CampaignValidationSummary.jsx` | Client-side validation issue list with jump-to-field |
| `DraftStatusBadge.jsx` | Lifecycle badge + `OditoDraftMarker` |

### Library / hooks
| File | Purpose |
| --- | --- |
| `lib/aiCampaignConstants.js` | Enum mirrors + label maps + RSA/brief limits + `friendlyErrorMessage()` + display helpers. Backend is the source of truth. |
| `lib/aiCampaignWorkspace.js` | Pure editable-state model: `initWorkspaceState`, `workspaceReducer` (reference-preserving), `toPatchPayload`, `isWorkspaceDirty`, `validateWorkspace`, `validateBrief`, `briefFromForm` |
| `hooks/useAiCampaign.js` | TanStack Query hooks: `useAiCampaignDrafts`, `useAiCampaignDraft`, `useGenerateAiCampaign`, `useUpdateAiCampaignDraft`, `useDeleteAiCampaignDraft` |

### Tests (26, Vitest — house style: `createRoot` + `act`, `vi.mock('@/lib/apiService')`, no RTL)
`lib/aiCampaignWorkspace.test.js` (14) · `hooks/useAiCampaign.test.jsx` (3) ·
`components/.../AiCampaignSetupForm.test.jsx` (4) · `components/.../AiCampaignWorkspace.test.jsx` (5)

## 2. Files modified

| File | Change | Risk |
| --- | --- | --- |
| `lib/apiService.js` | +5 AI-campaign methods (`generateAiCampaign`, `getAiCampaignDrafts`, `getAiCampaignDraft`, `updateAiCampaignDraft`, `deleteAiCampaignDraft`). In `handleResponse`, on a non-OK response also copy `data.data` → `error.data` and `data.errors` → `error.errors` (additive; every existing caller ignores them; enables recovering a preserved `draftId` from a failed generation). | Minimal — additive only |
| `lib/query/keys.js` | +`queryKeys.aiCampaign` block (`all` / `list` / `draft`). Deliberately **not** under `['google-ads', projectId]` so a dashboard sync never invalidates a draft and vice-versa. | None — new keys only |
| `components/dashboard/google-visibility/google-ads/GoogleAdsHeader.jsx` | Render `<CreateCampaignMenu>` in the action row when an account is selected; demote "Refresh Data" from primary to `variant="outline"` so the new "Create Campaign" is the primary CTA. | Small, deliberate visual hierarchy change; no behaviour change to Refresh |

No other existing file touched. No backend change. No dependency added (Zod/RHF not introduced — the project has no RHF and forms use controlled state per house style).

## 3. Existing components / infrastructure reused

- **API layer:** `lib/apiService.js` singleton (Bearer-JWT `request()`), never raw `fetch` in components.
- **Server state:** `@tanstack/react-query` v5 via `hooks/`, keys from `lib/query/keys.js`, `staleTimes` tiers from `lib/query/stale-times.js`. Provided app-wide by `providers/dashboard-providers` (through `app/app/layout.jsx`).
- **Project scope:** `useProject()` → `activeProjectId` / `activeProject` (`contexts/ProjectContext.jsx`).
- **Auth:** `AuthGuard` in `app/app/layout.jsx` — the new routes inherit it, no new auth code.
- **Connection state:** `useGoogleAdsConnection` (`hooks/useDashboardQueries.js`) to gate the builder on a selected account and to prefill currency.
- **UI kit:** shadcn/Radix `Card`, `Button`, `Badge`, `Input`, `Label`, `Textarea`, `Select`, `Separator`, `DropdownMenu`, `AlertDialog`, `Loader2`/lucide icons. No new primitives.
- **Toasts:** `useToastQueue` + `components/shared/ToastStack` (the app's existing lightweight pattern — no toast library exists) on the drafts list.
- **Formatting:** `lib/formatRelativeTime`.
- **Theme:** all colours via design tokens (`text-muted-foreground`, `bg-card`, `border-border/60`, `bg-primary/10`, …) — zero hardcoded hex; dark mode inherited.
- **Test conventions:** Vitest + jsdom + `createRoot`/`act`, `vi.mock('@/lib/apiService')`, `next/link` + `next/navigation` stubbed (matches `components/dashboard/social/*.test.jsx`).

## 4. Routes added

```
/app/google-visibility/google-ads/ai-campaigns            (static)  — drafts list
/app/google-visibility/google-ads/ai-campaigns/new        (static)  — setup + generation
/app/google-visibility/google-ads/ai-campaigns/[draftId]  (dynamic) — workspace
```

Entry point: `CreateCampaignMenu` on the existing Google Ads dashboard header (shown once a Google Ads account is selected). No sidebar/nav change.

## 5. API endpoints integrated (all via `apiService`, no direct fetch)

| UI action | Method | Endpoint |
| --- | --- | --- |
| Generate campaign | `POST` | `/google-ads/ai-campaigns/generate` (body `{ projectId, brief }`) |
| Drafts list | `GET` | `/google-ads/ai-campaigns/drafts?projectId=&limit=&sort=updatedAt&sortOrder=desc` |
| Load workspace | `GET` | `/google-ads/ai-campaigns/drafts/:draftId` |
| Save Draft | `PATCH` | `/google-ads/ai-campaigns/drafts/:draftId` (body `{ campaign, adGroups }` — whole objects) |
| Delete draft | `DELETE` | `/google-ads/ai-campaigns/drafts/:draftId` (offered only for `draft` / `failed`) |

`brief` body matches the Phase 2 validator exactly: `businessName?`, `businessDescription`,
`campaignGoal`, `targetAudience?`, `location{name,countryCode,type}`, `dailyBudget` (major
units — backend converts to micros), `currency`, `landingPageUrl?`, `additionalInstructions?`.
`googleAdsCustomerId` is **not** sent — the backend resolves it from the project's connected
account.

## 6. State architecture

| Layer | Where | What |
| --- | --- | --- |
| **Server state** | TanStack Query (`useAiCampaign*`) | the draft, the drafts list, the generate/patch/delete mutations. Query key `['ai-campaign','draft',draftId]`. `useGenerateAiCampaign` primes the new draft's cache entry so the workspace opens with no extra round-trip. `useUpdateAiCampaignDraft` writes the PATCH response back into the same cache entry (no refetch flash). |
| **Local UI state** | component `useReducer` / `useState` | the editable `{ campaign, adGroups }` copy (`workspaceReducer`), `activeSection`, `selectedAdGroupId`, dirty flag (derived), `savedAt`, `saveError`, the setup-form fields, dialogs, the generation phase (`setup`/`generating`/`error`). |

No Redux/Zustand introduced. Server state is never mirrored into a store. The editable copy
is initialised once from the server draft and re-synced **only** when the server `version`
changes **and** there are no unsaved edits (a background refetch can never discard local work).

## 7. Form architecture

Controlled local state + a small validation function — the project has no `react-hook-form`
and its forms (e.g. `LeadFormDialog`) use exactly this pattern.

- **Setup form:** `AiCampaignSetupForm` holds one flat state object; `validateBrief()` returns
  `{ errors, count }`; errors show after first submit (`touched`) or inline; submit is blocked
  and `onGenerate` is not called while `count > 0` or a generation is in flight.
- **Workspace:** `workspaceReducer` with typed actions
  (`campaign/setField`, `adGroup/add|remove|rename`, `keyword/add|update|remove`,
  `ad/add|remove|setField`, `asset/add|update|remove`). Every reducer branch preserves object
  identity for untouched ad groups / ads / keyword arrays. `validateWorkspace()` runs on each
  change (memoised) and drives `CampaignValidationSummary` + per-field borders.
- **Serialization:** `toPatchPayload()` strips client-only `_key`s, drops client-generated
  ad-group / ad ids (`ag_new*` / `ad_new*`) so the backend mints real ones, keeps real backend
  ids, filters empty keyword / asset rows, and passes `dailyBudget` as a plain major-unit
  number (no micros math anywhere in the frontend).

## 8. Component architecture

Small, single-responsibility components (largest is `AiCampaignWorkspace` at ~260 lines — the
orchestrator; every editor is 90–190 lines). The workspace is a three-section rail
(Overview / Campaign settings / Ad groups); within Ad groups only the **selected**
`AdGroupEditor` is mounted (others are chips), so a 20-ad-group campaign never renders 20
editors at once.

```
[draftId]/page.jsx
  └─ AiCampaignWorkspace                 (reducer state, dirty guard, save)
       ├─ CampaignValidationSummary
       ├─ CampaignOverviewCard           (read-only)
       ├─ CampaignSettingsForm
       ├─ AdGroupEditor  (memo)          ← only the selected one
       │    ├─ KeywordEditorTable (memo) ×2  (keywords / negatives)
       │    └─ ResponsiveSearchAdEditor (memo) ×N
       └─ CampaignSaveBar
```

## 9. Validation behavior

Two layers, backend authoritative:

1. **Client (UX only):** `validateBrief` (setup) and `validateWorkspace` (workspace) mirror
   the backend rules — required campaign name / goal / budget > 0 / 3-letter currency; ≥1
   location with 2-letter country + valid type; ≥1 ad group; non-empty keyword text + valid
   match type; RSA ≥3 headlines / ≥2 descriptions; headline ≤30 / description ≤90 / path ≤15
   chars; valid `http(s)` final URL. Shown as field borders + a jump-to summary. Submit /
   Save is **not** hard-blocked by workspace validation (the backend must still accept it),
   but the setup form is blocked until the brief is valid.
2. **Server:** the Phase 2 generate endpoint re-validates the brief; the Phase 1 PATCH
   re-normalizes and re-validates the whole draft. Any 4xx is surfaced through
   `friendlyErrorMessage`.

## 10. Error handling

`friendlyErrorMessage(err)` (`lib/aiCampaignConstants.js`) maps every failure to safe copy —
raw Claude / backend / stack text is never shown:

| Situation | Message |
| --- | --- |
| 429 / `RATE_LIMITED` / `AI_RATE_LIMITED` | "You're generating campaigns too quickly. Please wait a moment and try again." |
| `AI_TIMEOUT` | "Generating the campaign took too long. Your draft has been preserved — please try again." |
| `AI_PROVIDER_ERROR` / `AI_BAD_OUTPUT` / `GENERATION_FAILED` | "We couldn't generate the campaign right now. Your draft has been preserved. Please try again." |
| `AI_UNAVAILABLE` / `AI_OVERLOADED` | "AI campaign generation is not available right now…" |
| `CAMPAIGN_STRUCTURE_INVALID` (422) | "Some campaign details need attention before this campaign can be generated…" |
| 403 | "You don't have access to this project." |
| 404 (draft) | "This campaign draft could not be found. It may have been deleted." |
| network / no HTTP status | "We couldn't reach Odito. Check your connection and try again." |

Generation failures that still persisted a draft expose `err.data.draftId`; the error panel
then offers **Open preserved draft**. Save failures show inline in the save bar and keep the
user's edits.

## 11. Security considerations

- **No Anthropic / Claude call from the browser** — confirmed: the only network calls are the
  five `apiService` endpoints above; `grep` for `anthropic`/`api.anthropic.com`/`x-api-key` in
  the new code returns nothing. No API key is referenced or read.
- **No Google Ads mutation** — no publish/enable/pause control exists; the workspace never
  calls any Google Ads endpoint.
- **No unsafe HTML** — no `dangerouslySetInnerHTML`, no `eval`, no HTML injection. Every
  AI-produced string is rendered as a React text node or an input `value`.
- **Backend is the authorization authority** — `projectId` comes from `useProject()` (server
  session-scoped); the browser never asserts ownership. All routes sit under the app's
  `AuthGuard`. Draft `status` is always read from the server (`draft.status`), never trusted
  from local state — the editable copy only ever holds `campaign` / `adGroups`.
- **Mass-assignment safe** — `toPatchPayload` sends only `{ campaign, adGroups }`; the backend
  additionally rejects `status`/`version`/`aiMetadata` in a PATCH.
- **Publish-stage drafts** (`publishing` / `published`, not reachable in Phase 3) render
  read-only with an explanatory banner and no save bar.

## 12. Performance considerations

- **No full-page refetch on edit** — the workspace edits a local reducer copy; only an
  explicit **Save Draft** hits the network, and the mutation writes the response straight into
  the draft's cache entry (`setQueryData`) so the workspace does not unmount/remount.
- **Stable query keys** — factory-generated; the AI-campaign namespace is isolated from
  `['google-ads', projectId]` so a dashboard sync and a draft save never invalidate each other.
- **Render isolation** — `workspaceReducer` preserves references for untouched sub-trees;
  `AdGroupEditor` / `KeywordEditorTable` / `ResponsiveSearchAdEditor` are `React.memo`. The
  `AdGroupEditor` comparator ignores the `errors` object identity (which changes on every
  keystroke) and compares this group's error subset by `errorsHash`, so a validation change in
  ad group A does not re-render ad group B. Test `workspaceReducer — reference preservation`
  locks this in.
- **Large campaigns** — only the selected ad-group editor is mounted; the rest are cheap
  chips. Structure supports adding row virtualization later (flat, keyed lists) without a
  model change; not implemented now (current sizes don't justify it, per spec §37).
- **No polling** — generation is a single request with one lifecycle; the loading stages are a
  local timer, not network activity. `staleTime: STATIC` on a loaded draft avoids refetch
  churn while editing.
- **No layout-shift animation** — the generation spinner and save-bar states swap text/icons
  in place.

## 13. Accessibility considerations

- Every input has a `<Label htmlFor>` or an `aria-label` (keyword rows, asset rows, icon
  buttons).
- Field errors render adjacent to their input; the setup form marks invalid `Input`s and uses
  `role="alert"` for messages; the generation stage list is `aria-live="polite"`.
- Section rail buttons expose `aria-current`; icon-only remove buttons have descriptive
  `aria-label`s.
- Dialogs / dropdowns are Radix primitives (focus trap, ESC, roving focus) — no custom
  overlay.
- Visible focus + sufficient contrast come from the shared token theme; no keyboard traps
  (verified in the workspace test by tabbing through inputs).

## 14. Tests added

| Suite | n | Covers |
| --- | --- | --- |
| `lib/aiCampaignWorkspace.test.js` | 14 | `initWorkspaceState` (budget major-unit + client keys, id preservation, micros fallback); reducer **reference preservation** (edit group A → group B same ref, sibling ad same ref); add/remove ad group + keyword; `toPatchPayload` (no `_key`, drops client ids, keeps real ids, filters empties, major-unit budget, omits blank finalUrl/path); `isWorkspaceDirty` (clean → edit → revert); `validateWorkspace` (empty keyword, missing match type, >30-char headline, bad URL, empty budget, RSA minimums; passes for a full Nashik draft); `validateBrief` + `briefFromForm` (valid, every rejection, blank-optional omission) |
| `hooks/useAiCampaign.test.jsx` | 3 | `useGenerateAiCampaign` calls `apiService.generateAiCampaign(projectId, brief, undefined)` and primes the new draft cache; `useUpdateAiCampaignDraft` PATCHes and writes the response into the draft cache; `useDeleteAiCampaignDraft` calls DELETE and removes the cache entry |
| `components/.../AiCampaignSetupForm.test.jsx` | 4 | required fields block submit + show "needs attention"; invalid budget + invalid URL rejected with messages; valid fields clear their errors; **generate button disabled while `isGenerating`** (duplicate-submit prevention) |
| `components/.../AiCampaignWorkspace.test.jsx` | 5 | renders campaign overview (name / goal / "Odito draft" / structure counts); Ad groups section renders keywords, negatives, RSA headlines/descriptions from the draft; **Save disabled until dirty**, then calls `onSave` once with a backend-shaped payload (no `_key`, major-unit budget, edited keyword); add/remove ad group; **published draft → no save bar, read-only banner** |

All tests are hermetic: `apiService` mocked, `next/link` + `next/navigation` stubbed. No test
needs `ANTHROPIC_API_KEY`, the Anthropic network, a Google Ads account, real OAuth, or a DB.

## 15. Test results

- **Phase 3 suites: 26 / 26 pass.**
- **Full frontend Vitest suite: 504 pass / 1 fail** (`app/onpage/components/VerificationHistoryPanel.test.jsx` — a date-format locale assertion `"27 Jul 2026"` vs `"Jul 27, 2026"`, pre-existing, unrelated to this phase; no AI-campaign, Google Ads, auth, or routing test fails).
- **`next build`: EXIT 0 — "✓ Compiled successfully", type check valid, "✓ Generating static pages (79/79)".** The 3 new routes build (`/ai-campaigns` 8.4 kB static, `/ai-campaigns/new` 5.6 kB static, `/ai-campaigns/[draftId]` 11.2 kB dynamic). ESLint reports `Plugin "" not found` — a pre-existing broken `eslint.config.mjs` flat-config that fails identically on the untouched repo (`npm run lint` / `next lint` both hit it); it is not a lint error in the new code.
- **Backend AI Campaign tests (regression): 132 / 132 pass** — no backend file was changed.

## 16. Existing unrelated failures

| Failure | Where | Why it is unrelated |
| --- | --- | --- |
| `VerificationHistoryPanel > only lists runs for the current page…` | `app/onpage/components/VerificationHistoryPanel.test.jsx` | Date rendered as `27 Jul 2026` (locale `en-GB`-ish) vs the test's expected `Jul 27, 2026`. This phase never touches onpage/verification or date formatting. Fails the same way before this phase. |
| `ESLint: Plugin "" not found` during `next build` | `eslint.config.mjs` | Broken flat-config in the repo; fails on a pristine checkout. Build still exits 0. |
| Intermittent `Static worker exited (code 1)` prerendering `/login` | Next 15.1.6 static export worker | Non-deterministic — reproduced twice, then 3 consecutive clean builds passed on identical code. `/login` is untouched; "✓ Compiled successfully" every time. |
| `recharts` "width(-1) height(-1)" stderr noise | several social chart tests | jsdom has no layout; pre-existing warning, tests pass. |

## 17. Confirmation — Claude is never called directly from the frontend

**Confirmed.** The browser talks only to the five Odito endpoints listed in §5. There is no
Anthropic SDK import, no `api.anthropic.com` URL, no `x-api-key` / `ANTHROPIC_API_KEY`
reference anywhere in the Phase 3 code. Generation goes
`AiCampaignSetupForm → useGenerateAiCampaign → apiService.generateAiCampaign → POST /google-ads/ai-campaigns/generate`
and the Phase 2 backend owns the Claude call.

## 18. Confirmation — Google Ads publishing was not implemented

**Confirmed.** No component renders a publish / launch / enable / pause control. No code path
calls any Google Ads mutation endpoint. The workspace shows an explicit
"Odito draft · not published to Google Ads" marker, and a `publishing` / `published` draft is
rendered read-only with a banner that says a later step owns it.

## 19. Confirmation — conversational AI editing was not implemented

**Confirmed.** There is no chat panel, no "Ask AI" / "Improve with AI" / "Rewrite" button, no
AI suggestion, no AI diff, and no accept/reject workflow. All editing is manual through the
reducer-backed forms. The architecture leaves room for Phase 4 to attach: the editable state
is a single reducer whose actions could be produced by an AI proposal, `toPatchPayload` is the
one serialization point, and the draft already carries `version` + `changes` server-side.

## 20. Recommended Phase 4 scope

**Phase 4 — Conversational AI Campaign Editing + AI Change Diff + Accept/Reject.**

1. **Backend:** a `POST /google-ads/ai-campaigns/drafts/:draftId/assist` endpoint —
   takes `{ instruction }` + the current draft, calls Claude with a *diff-oriented* prompt,
   returns a set of proposed `changes` (reusing the Phase 1 `changes[]` shape:
   `{ source:'AI', action, path, before, after }`) **without persisting**. A second endpoint
   (or a flag on PATCH) applies an approved change set and appends to `changes[]` +
   increments `version`.
2. **Frontend:** an "AI assistant" side panel in `AiCampaignWorkspace` (the reducer + section
   rail already accommodate it). Proposed changes render as a diff list keyed by `path`;
   Accept dispatches the equivalent reducer action(s) (or a new `applyChangeSet` action) and
   marks the workspace dirty; Reject discards. Save still goes through the existing
   whole-draft PATCH.
3. **Reuse from Phase 3:** `workspaceReducer` (extend with `applyChangeSet`), `toPatchPayload`,
   `friendlyErrorMessage`, the provider/error patterns, `useUpdateAiCampaignDraft`,
   `AdGroupEditor` memo isolation, the setup form's validation approach.
4. **Keep out of Phase 4:** publishing (Phase 6), performance-based optimization (Phase 7),
   autonomous edits (always user-approved).

---

### Notes / known limitations

- The setup form's Country and Currency use Radix `Select` shortlists but accept the
  connected-account currency and any code the backend validates; a full geo-autocomplete is
  intentionally out of scope (spec §8 — the backend resolves Google Ads location ids later).
- Language editing is a single free-text name field (the draft schema stores `{code,name}`;
  Phase 3 edits `name` and leaves `code` as generated). A proper language picker can come with
  Phase 5/6.
- Unsaved-changes navigation guard is `beforeunload` only (spec §21 — no custom router
  blocker); in-app navigation away from the workspace does not prompt, by design.
- Ad-group and ad reordering is not offered (add / edit / remove only) — matches the
  whole-draft PATCH contract and avoids index-churn.
