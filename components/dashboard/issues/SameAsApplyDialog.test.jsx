import { describe, test, expect, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"
import SameAsApplyDialog from "./SameAsApplyDialog"

const FB = "https://www.facebook.com/naxonify"
const TW = "https://twitter.com/naxonify"
const YT = "https://www.youtube.com/@naxonify"
const IG = "https://www.instagram.com/naxonify"
const LI = "https://www.linkedin.com/company/naxonify"
const X = "https://x.com/naxonify"
const TT = "https://www.tiktok.com/@naxonify"
const PI = "https://www.pinterest.com/naxonify"
const BE = "https://www.behance.net/naxonify"

const ORG = (over = {}) => ({ protectedSameAs: [], additionalSameAs: [], ...over })

function setup(props = {}) {
  const onConfirm = vi.fn()
  const onOpenChange = vi.fn()
  const onRefreshLiveValue = vi.fn()
  const utils = render(
    <SameAsApplyDialog
      open
      onOpenChange={onOpenChange}
      siteLabel="https://naxonify.com"
      providerLabel="Rank Math"
      organization={ORG()}
      organizationLoading={false}
      organizationUnavailable={false}
      onConfirm={onConfirm}
      onRefreshLiveValue={onRefreshLiveValue}
      isApplying={false}
      errorInfo={null}
      {...props}
    />
  )
  return { onConfirm, onOpenChange, onRefreshLiveValue, ...utils }
}

const applyButton = () => screen.getByRole("button", { name: /Apply via WordPress/ })
const field = (label) => screen.getByLabelText(`${label} profile URL`)
const other = (n = 1) => screen.getByLabelText(`Other profile URL ${n}`)
const type = (el, value) => fireEvent.change(el, { target: { value } })
const card = (id) => screen.getByTestId(`sameas-card-${id}`)
const payload = (onConfirm) => onConfirm.mock.calls[0][0]

describe("SameAsApplyDialog — layout", () => {
  test("keeps the title, website, provider, SITE-WIDE scope and the site-wide warning verbatim", () => {
    setup()
    expect(screen.getByText("Add Social Profiles to Organization Schema?")).toBeInTheDocument()
    expect(screen.getByText(/Website: https:\/\/naxonify\.com · Provider: Rank Math · Scope: SITE-WIDE/)).toBeInTheDocument()
    expect(screen.getByText("This is a SITE-WIDE change — it affects Organization schema on every page, not just this one.")).toBeInTheDocument()
  })

  test("shows a SOCIAL PROFILES section with one labelled field per platform — LinkedIn is not the only (or default) option", () => {
    setup()
    expect(screen.getByText("Social profiles")).toBeInTheDocument()
    for (const label of ["Facebook", "Instagram", "LinkedIn", "X / Twitter", "YouTube", "TikTok", "Pinterest"]) {
      expect(field(label)).toBeInTheDocument()
      expect(field(label)).toHaveValue("")
    }
    expect(screen.getByText("Other / Custom Profile")).toBeInTheDocument()
    expect(other(1)).toHaveValue("")
  })

  test("each platform has its own placeholder", () => {
    setup()
    expect(field("Facebook")).toHaveAttribute("placeholder", "https://facebook.com/your-page")
    expect(field("Instagram")).toHaveAttribute("placeholder", "https://instagram.com/your-profile")
    expect(field("LinkedIn")).toHaveAttribute("placeholder", "https://linkedin.com/company/your-company")
    expect(field("X / Twitter")).toHaveAttribute("placeholder", "https://x.com/your-profile")
    expect(field("YouTube")).toHaveAttribute("placeholder", "https://youtube.com/@your-channel")
    expect(field("TikTok")).toHaveAttribute("placeholder", "https://tiktok.com/@your-profile")
    expect(field("Pinterest")).toHaveAttribute("placeholder", "https://pinterest.com/your-profile")
    expect(other(1)).toHaveAttribute("placeholder", "https://...")
  })

  test("every card has an icon (Tabler brand icons already used in Odito) — including Other", () => {
    setup()
    for (const id of ["facebook", "instagram", "linkedin", "x", "youtube", "tiktok", "pinterest", "other"]) {
      expect(card(id).querySelector("svg")).not.toBeNull()
    }
  })

  test("uses a responsive grid (2 columns when they fit, 1 on a phone) and Other spans the full width", () => {
    setup()
    const grid = card("facebook").parentElement
    expect(grid.style.gridTemplateColumns).toMatch(/auto-fit.*minmax\(250px/)
    expect(card("other").style.gridColumn).toBe("1 / -1")
  })

  test("the old single LinkedIn-only input and the read-only 'not provided in context' box are gone", () => {
    setup()
    expect(screen.queryByLabelText("Social profile URL 1")).not.toBeInTheDocument()
    expect(screen.queryByText(/not provided in context/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Proposed Addition/i)).not.toBeInTheDocument()
  })

  test("says every field is optional, and that Odito never guesses", () => {
    setup()
    expect(screen.getByText(/Add your verified social profile URLs below/)).toBeInTheDocument()
    expect(screen.getByText(/All fields are optional/)).toBeInTheDocument()
    expect(screen.getByText(/Odito never guesses these/)).toBeInTheDocument()
    expect(screen.getByText(/No social profiles are configured on your site yet/)).toBeInTheDocument()
  })

  test("loading, unavailable and capability-unavailable states never show the fields", () => {
    const first = setup({ organizationLoading: true })
    expect(screen.getByText("Loading current profiles…")).toBeInTheDocument()
    expect(screen.queryByLabelText("Facebook profile URL")).not.toBeInTheDocument()
    first.unmount()

    const second = setup({ organizationUnavailable: true })
    expect(screen.getByText(/Unable to read the current profiles/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Refresh Live Value" })).toBeInTheDocument()
    second.unmount()

    setup({ unavailableReason: "This WordPress site is running an older version of the Odito SEO Bridge." })
    expect(screen.getByRole("alert")).toHaveTextContent(/older version of the Odito SEO Bridge/)
    expect(screen.queryByLabelText("Facebook profile URL")).not.toBeInTheDocument()
    expect(applyButton()).toBeDisabled()
  })
})

describe("SameAsApplyDialog — optional fields and the Apply button", () => {
  test("Apply is disabled until at least one valid URL is entered (all fields empty)", () => {
    setup()
    expect(applyButton()).toBeDisabled()
  })

  test("ONE valid URL in ANY single field enables Apply — no other platform is required", () => {
    for (const [label, url] of [["Facebook", FB], ["Instagram", IG], ["LinkedIn", LI], ["X / Twitter", X], ["YouTube", YT], ["TikTok", TT], ["Pinterest", PI]]) {
      const { unmount, onConfirm } = setup()
      type(field(label), url)
      expect(applyButton()).toBeEnabled()
      fireEvent.click(applyButton())
      expect(payload(onConfirm).additionalProfiles).toEqual([url])
      unmount()
    }
  })

  test("the spec's example: Facebook empty, Instagram + LinkedIn filled, X and YouTube empty -> valid, sends just those two", () => {
    const { onConfirm } = setup()
    type(field("Instagram"), "https://instagram.com/naxonify")
    type(field("LinkedIn"), "https://linkedin.com/company/naxonify")
    expect(applyButton()).toBeEnabled()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    fireEvent.click(applyButton())
    expect(payload(onConfirm).additionalProfiles).toEqual(["https://instagram.com/naxonify", "https://linkedin.com/company/naxonify"])
  })

  test("empty and whitespace-only fields are ignored — never an error, never sent", () => {
    const { onConfirm } = setup()
    type(field("Facebook"), "   ")
    type(field("YouTube"), YT)
    fireEvent.blur(field("Facebook"))
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    fireEvent.click(applyButton())
    expect(payload(onConfirm).additionalProfiles).toEqual([YT])
  })

  test("a valid URL next to an invalid one still blocks Apply until the bad one is fixed or cleared", () => {
    setup()
    type(field("Instagram"), IG)
    type(field("TikTok"), "not a url")
    expect(applyButton()).toBeDisabled()
    type(field("TikTok"), "")
    expect(applyButton()).toBeEnabled()
  })
})

describe("SameAsApplyDialog — adding several profiles at once", () => {
  test("all seven platforms plus a custom one: everything selected is sent, normalized, in platform order", () => {
    const { onConfirm } = setup()
    type(other(1), `${BE}/`)
    type(field("Pinterest"), PI)
    type(field("TikTok"), TT)
    type(field("YouTube"), YT)
    type(field("X / Twitter"), X)
    type(field("LinkedIn"), LI)
    type(field("Instagram"), IG)
    type(field("Facebook"), FB)
    expect(screen.getByTestId("sameas-summary")).toHaveTextContent("Will add 8 profiles.")
    fireEvent.click(applyButton())
    expect(payload(onConfirm).additionalProfiles).toEqual([FB, IG, LI, X, YT, TT, PI, BE])
  })

  for (const n of [2, 3, 4, 5]) {
    test(`${n} profiles filled simultaneously are all sent`, () => {
      const { onConfirm } = setup()
      const chosen = [["Facebook", FB], ["Instagram", IG], ["LinkedIn", LI], ["X / Twitter", X], ["YouTube", YT]].slice(0, n)
      chosen.forEach(([label, url]) => type(field(label), url))
      expect(screen.getByTestId("sameas-summary")).toHaveTextContent(`Will add ${n} profiles.`)
      fireEvent.click(applyButton())
      expect(payload(onConfirm).additionalProfiles).toEqual(chosen.map(([, url]) => url))
    })
  }

  test("the payload is ONLY the three flat lists — no platform ids, storage keys, option names or schema", () => {
    const { onConfirm } = setup({ organization: ORG({ additionalSameAs: [YT] }) })
    type(field("LinkedIn"), LI)
    fireEvent.click(applyButton())
    const sent = payload(onConfirm)
    expect(Object.keys(sent).sort()).toEqual(["additionalProfiles", "expectedAdditionalProfiles", "removeProfiles"])
    expect(sent).toEqual({ additionalProfiles: [LI], removeProfiles: [], expectedAdditionalProfiles: [YT] })
    expect(JSON.stringify(sent)).not.toMatch(/facebook"|platform|option|meta|rank|schema/i)
  })

  test("URLs are trimmed and normalized, never rewritten to another host or scheme", () => {
    const { onConfirm } = setup()
    type(field("LinkedIn"), "  HTTPS://WWW.LinkedIn.com/company/naxonify/  ")
    type(field("Instagram"), "http://instagram.com/naxonify")
    fireEvent.click(applyButton())
    expect(payload(onConfirm).additionalProfiles).toEqual(["http://instagram.com/naxonify", "https://www.linkedin.com/company/naxonify"])
  })
})

describe("SameAsApplyDialog — Other / Custom profile", () => {
  test("accepts any valid http(s) URL, with no platform warning", () => {
    const { onConfirm } = setup()
    type(other(1), "https://mastodon.social/@naxonify")
    fireEvent.blur(other(1))
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    fireEvent.click(applyButton())
    expect(payload(onConfirm).additionalProfiles).toEqual(["https://mastodon.social/@naxonify"])
  })

  test("more custom profiles can be added and removed; the last row just clears", () => {
    const { onConfirm } = setup()
    type(other(1), BE)
    fireEvent.click(screen.getByRole("button", { name: "+ Add another profile" }))
    type(other(2), "https://mastodon.social/@naxonify")
    fireEvent.click(applyButton())
    expect(payload(onConfirm).additionalProfiles).toEqual([BE, "https://mastodon.social/@naxonify"])
  })

  test("removing a custom row drops it", () => {
    setup()
    type(other(1), BE)
    fireEvent.click(screen.getByRole("button", { name: "+ Add another profile" }))
    type(other(2), "https://mastodon.social/@naxonify")
    fireEvent.click(screen.getByRole("button", { name: "Remove other profile row 1" }))
    expect(screen.queryByLabelText("Other profile URL 2")).not.toBeInTheDocument()
    expect(other(1)).toHaveValue("https://mastodon.social/@naxonify")
    fireEvent.click(screen.getByRole("button", { name: "Remove other profile row 1" }))
    expect(other(1)).toHaveValue("")
    expect(applyButton()).toBeDisabled()
  })

  test("the number of custom rows is capped", () => {
    setup()
    for (let i = 0; i < 10; i += 1) {
      const add = screen.getByRole("button", { name: "+ Add another profile" })
      if (add.disabled) break
      fireEvent.click(add)
    }
    expect(screen.getAllByLabelText(/Other profile URL \d+/)).toHaveLength(5)
    expect(screen.getByRole("button", { name: "+ Add another profile" })).toBeDisabled()
  })

  test("more than 10 profiles in total blocks Apply with a clear message", () => {
    setup()
    for (const label of ["Facebook", "Instagram", "LinkedIn", "X / Twitter", "YouTube", "TikTok", "Pinterest"]) {
      type(field(label), `https://example.com/${label.replace(/\W/g, "")}`)
    }
    for (let i = 0; i < 4; i += 1) fireEvent.click(screen.getByRole("button", { name: "+ Add another profile" }))
    for (let i = 1; i <= 4; i += 1) type(other(i), `https://example.org/p${i}`)
    expect(screen.getByRole("alert")).toHaveTextContent("You can add at most 10 profiles at a time.")
    expect(applyButton()).toBeDisabled()
  })
})

describe("SameAsApplyDialog — validation", () => {
  for (const [label, value, message] of [
    ["javascript:", "javascript:alert(1)", /must start with http/],
    ["data:", "data:text/html;base64,PHNjcmlwdD4=", /must start with http/],
    ["relative", "/company/naxonify", /must start with http/],
    ["no scheme", "www.linkedin.com/company/naxonify", /must start with http/],
    ["HTML", '<a href="https://x.com/a">x</a>', /not allowed/],
    ["inner whitespace", "https://x.com/na xonify", /not allowed/],
    ["malformed", "https://", /not a valid URL/],
    ["not a public host", "https://localhost/a", /public website address/],
  ]) {
    test(`an invalid URL (${label}) shows its reason once the field is left, and keeps Apply disabled`, () => {
      const { onConfirm } = setup()
      type(field("LinkedIn"), value)
      fireEvent.blur(field("LinkedIn"))
      expect(screen.getByRole("alert")).toHaveTextContent(message)
      expect(field("LinkedIn")).toHaveAttribute("aria-invalid", "true")
      expect(applyButton()).toBeDisabled()
      fireEvent.click(applyButton())
      expect(onConfirm).not.toHaveBeenCalled()
    })
  }

  test("the error is not shown while the user is still typing (before the field is left)", () => {
    setup()
    type(field("LinkedIn"), "htt")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(applyButton()).toBeDisabled()
  })

  test("the same URL in two fields (even with a trailing slash / other scheme) is a duplicate and blocks Apply", () => {
    setup()
    type(field("Instagram"), IG)
    type(field("Facebook"), `${IG}/`)
    fireEvent.blur(field("Facebook"))
    expect(screen.getByRole("alert")).toHaveTextContent("This URL is listed more than once.")
    expect(applyButton()).toBeDisabled()
  })

  test("the same URL in a platform field and an Other row is a duplicate too", () => {
    setup()
    type(field("YouTube"), YT)
    type(other(1), YT)
    fireEvent.blur(other(1))
    expect(screen.getByRole("alert")).toHaveTextContent("This URL is listed more than once.")
    expect(applyButton()).toBeDisabled()
  })

  test("a URL that is already on the site (protected or saved) is flagged, not silently 'applied'", () => {
    setup({ organization: ORG({ protectedSameAs: [FB], additionalSameAs: [YT] }) })
    type(field("Facebook"), "http://www.facebook.com/naxonify/")
    fireEvent.blur(field("Facebook"))
    expect(screen.getByRole("alert")).toHaveTextContent("This profile is already on your site.")
    expect(applyButton()).toBeDisabled()
  })
})

describe("SameAsApplyDialog — platform mismatch is a NON-BLOCKING warning", () => {
  test("Instagram URL in the Facebook field: warns with the exact text, still enables Apply, and sends the URL unchanged", () => {
    const { onConfirm } = setup()
    type(field("Facebook"), "https://instagram.com/naxonify")
    const warning = screen.getByRole("status")
    expect(warning).toHaveTextContent("This URL does not appear to be a Facebook URL. Please verify it.")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(field("Facebook")).toHaveAttribute("aria-invalid", "false")
    expect(applyButton()).toBeEnabled()
    fireEvent.click(applyButton())
    expect(payload(onConfirm).additionalProfiles).toEqual(["https://instagram.com/naxonify"])
  })

  test("a URL in the right field has no warning", () => {
    setup()
    type(field("Facebook"), FB)
    type(field("X / Twitter"), "https://twitter.com/naxonify")
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  test("the warning appears under the field it belongs to", () => {
    setup()
    type(field("LinkedIn"), "https://example.com/naxonify")
    expect(within(card("linkedin")).getByRole("status")).toHaveTextContent("does not appear to be a LinkedIn URL")
    expect(within(card("facebook")).queryByRole("status")).not.toBeInTheDocument()
  })

  test("no warning for an invalid URL (the error takes over), and none for Other", () => {
    setup()
    type(field("Facebook"), "javascript:alert(1)")
    fireEvent.blur(field("Facebook"))
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })
})

describe("SameAsApplyDialog — protected Rank Math profiles", () => {
  test("Facebook and X/Twitter profiles from Rank Math are shown in THEIR cards as read-only 'Protected by Rank Math', with no remove control", () => {
    setup({ organization: ORG({ protectedSameAs: [FB, TW] }) })
    const fb = within(card("facebook")).getByTestId("sameas-protected-facebook")
    expect(fb).toHaveTextContent(FB)
    expect(fb).toHaveTextContent("Protected by Rank Math")
    const x = within(card("x")).getByTestId("sameas-protected-x")
    expect(x).toHaveTextContent(TW)
    expect(x).toHaveTextContent("Protected by Rank Math")
    expect(within(fb).queryByRole("button")).not.toBeInTheDocument()
    expect(within(x).queryByRole("button")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: `Remove ${FB}` })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: `Remove ${TW}` })).not.toBeInTheDocument()
  })

  test("protected values are never part of the payload and can't be re-sent as 'new'", () => {
    const { onConfirm } = setup({ organization: ORG({ protectedSameAs: [FB, TW] }) })
    type(field("LinkedIn"), LI)
    fireEvent.click(applyButton())
    const sent = payload(onConfirm)
    expect(sent.additionalProfiles).toEqual([LI])
    expect(sent.removeProfiles).toEqual([])
    expect(sent.expectedAdditionalProfiles).toEqual([])
    expect(JSON.stringify(sent)).not.toContain("facebook.com")
    expect(JSON.stringify(sent)).not.toContain("twitter.com")
  })

  test("typing the protected Facebook URL again is rejected as already on the site", () => {
    setup({ organization: ORG({ protectedSameAs: [FB] }) })
    type(field("Facebook"), FB)
    fireEvent.blur(field("Facebook"))
    expect(screen.getByRole("alert")).toHaveTextContent("already on your site")
    expect(applyButton()).toBeDisabled()
  })

  test("the input beside a protected value is still an add-only field for ADDITIONAL profiles", () => {
    const { onConfirm } = setup({ organization: ORG({ protectedSameAs: [FB] }) })
    type(field("Facebook"), "https://www.facebook.com/naxonify-labs")
    fireEvent.click(applyButton())
    expect(payload(onConfirm).additionalProfiles).toEqual(["https://www.facebook.com/naxonify-labs"])
  })
})

describe("SameAsApplyDialog — existing additional profiles", () => {
  test("saved profiles appear in the field of their platform; unknown hosts under Other / Custom", () => {
    setup({ organization: ORG({ additionalSameAs: [LI, IG, YT, BE, "https://mastodon.social/@naxonify"] }) })
    expect(within(card("linkedin")).getByTestId("sameas-saved-linkedin")).toHaveTextContent(LI)
    expect(within(card("instagram")).getByTestId("sameas-saved-instagram")).toHaveTextContent(IG)
    expect(within(card("youtube")).getByTestId("sameas-saved-youtube")).toHaveTextContent(YT)
    const others = within(card("other")).getAllByTestId("sameas-saved-other")
    expect(others.map((n) => n.textContent)).toEqual([expect.stringContaining(BE), expect.stringContaining("https://mastodon.social/@naxonify")])
    expect(within(card("facebook")).queryByTestId("sameas-saved-facebook")).not.toBeInTheDocument()
  })

  test("regional and mobile hosts map too (pinterest.co.uk, m.facebook.com, twitter.com -> X)", () => {
    setup({ organization: ORG({ additionalSameAs: ["https://www.pinterest.co.uk/naxonify", "https://m.facebook.com/naxonify-labs", TW] }) })
    expect(within(card("pinterest")).getByTestId("sameas-saved-pinterest")).toBeInTheDocument()
    expect(within(card("facebook")).getByTestId("sameas-saved-facebook")).toBeInTheDocument()
    expect(within(card("x")).getByTestId("sameas-saved-x")).toBeInTheDocument()
  })

  test("MERGE: existing YouTube is preserved (not in additionalProfiles, not removed) when Instagram and LinkedIn are added", () => {
    const { onConfirm } = setup({ organization: ORG({ additionalSameAs: [YT] }) })
    type(field("Instagram"), IG)
    type(field("LinkedIn"), LI)
    fireEvent.click(applyButton())
    expect(payload(onConfirm)).toEqual({
      additionalProfiles: [IG, LI],
      removeProfiles: [],
      expectedAdditionalProfiles: [YT],
    })
  })

  test("saved profiles are labelled and the 'no profiles' hint is hidden once something exists", () => {
    setup({ organization: ORG({ additionalSameAs: [YT] }) })
    expect(within(card("youtube")).getByText("Saved")).toBeInTheDocument()
    expect(screen.queryByText(/No social profiles are configured on your site yet/)).not.toBeInTheDocument()
  })

  test("Remove asks for confirmation first — nothing is marked until it is confirmed", () => {
    setup({ organization: ORG({ additionalSameAs: [YT, IG] }) })
    fireEvent.click(screen.getByRole("button", { name: `Remove ${YT}` }))
    expect(screen.getByText("Remove from your website?")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Keep" }))
    expect(screen.queryByText("Remove from your website?")).not.toBeInTheDocument()
    expect(screen.queryByText("Will be removed")).not.toBeInTheDocument()
  })

  test("a confirmed removal is pending, can be undone, and is sent together with the additions", () => {
    const { onConfirm } = setup({ organization: ORG({ protectedSameAs: [FB], additionalSameAs: [YT, IG] }) })
    type(field("LinkedIn"), LI)
    fireEvent.click(screen.getByRole("button", { name: `Remove ${YT}` }))
    fireEvent.click(screen.getByRole("button", { name: `Confirm remove ${YT}` }))
    expect(screen.getByText("Will be removed")).toBeInTheDocument()
    expect(screen.getByTestId("sameas-summary")).toHaveTextContent("Will add 1 profile and remove 1.")
    fireEvent.click(applyButton())
    expect(payload(onConfirm)).toEqual({ additionalProfiles: [LI], removeProfiles: [YT], expectedAdditionalProfiles: [YT, IG] })
  })

  test("Undo cancels a pending removal", () => {
    const { onConfirm } = setup({ organization: ORG({ additionalSameAs: [YT] }) })
    type(field("LinkedIn"), LI)
    fireEvent.click(screen.getByRole("button", { name: `Remove ${YT}` }))
    fireEvent.click(screen.getByRole("button", { name: `Confirm remove ${YT}` }))
    fireEvent.click(screen.getByRole("button", { name: `Keep ${YT}` }))
    fireEvent.click(applyButton())
    expect(payload(onConfirm).removeProfiles).toEqual([])
  })

  test("a removal alone (nothing added) cannot be applied", () => {
    setup({ organization: ORG({ additionalSameAs: [YT] }) })
    fireEvent.click(screen.getByRole("button", { name: `Remove ${YT}` }))
    fireEvent.click(screen.getByRole("button", { name: `Confirm remove ${YT}` }))
    expect(applyButton()).toBeDisabled()
  })

  test("a pending removal that vanished from the live list (after a refresh) is not sent", () => {
    const { onConfirm, rerender } = setup({ organization: ORG({ additionalSameAs: [YT, IG] }) })
    type(field("LinkedIn"), LI)
    fireEvent.click(screen.getByRole("button", { name: `Remove ${YT}` }))
    fireEvent.click(screen.getByRole("button", { name: `Confirm remove ${YT}` }))

    rerender(
      <SameAsApplyDialog
        open onOpenChange={() => {}} organization={ORG({ additionalSameAs: [IG] })}
        organizationLoading={false} organizationUnavailable={false} onConfirm={onConfirm} onRefreshLiveValue={() => {}} isApplying={false} errorInfo={null}
      />
    )
    fireEvent.click(applyButton())
    expect(payload(onConfirm)).toEqual({ additionalProfiles: [LI], removeProfiles: [], expectedAdditionalProfiles: [IG] })
  })
})

describe("SameAsApplyDialog — applying and errors", () => {
  test("Cancel closes without applying", () => {
    const { onOpenChange, onConfirm } = setup()
    type(field("LinkedIn"), LI)
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  test("while applying: every field is locked and the button says so — no success is claimed here", () => {
    setup({ isApplying: true })
    expect(field("Facebook")).toBeDisabled()
    expect(other(1)).toBeDisabled()
    expect(screen.getByRole("button", { name: "Applying…" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
    expect(screen.queryByText(/added to WordPress\./i)).not.toBeInTheDocument()
  })

  test("a stale-list conflict swaps Apply for 'Refresh Live Value' and keeps what the user typed", () => {
    const { onRefreshLiveValue } = setup({
      errorInfo: { message: "The social profiles on WordPress have changed since this dialog was opened.", isConflict: true, requiresRefresh: true },
    })
    expect(screen.getByRole("alert")).toHaveTextContent(/changed since this dialog was opened/)
    expect(screen.queryByRole("button", { name: /Apply via WordPress/ })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Refresh Live Value" }))
    expect(onRefreshLiveValue).toHaveBeenCalledTimes(1)
  })

  test("typed values in several platforms survive an error being shown", () => {
    const { rerender, onConfirm } = setup()
    type(field("Instagram"), IG)
    type(field("LinkedIn"), LI)
    rerender(
      <SameAsApplyDialog
        open onOpenChange={() => {}} organization={ORG()} organizationLoading={false} organizationUnavailable={false}
        onConfirm={onConfirm} onRefreshLiveValue={() => {}} isApplying={false} errorInfo={{ message: "Failed to write this change to WordPress." }}
      />
    )
    expect(field("Instagram")).toHaveValue(IG)
    expect(field("LinkedIn")).toHaveValue(LI)
    expect(applyButton()).toBeEnabled()
  })

  test("a partial write says some profiles may already be saved", () => {
    setup({ errorInfo: { message: "Failed to write this change to WordPress.", partialWrite: true } })
    expect(screen.getByRole("alert")).toHaveTextContent(/Some profiles may already have been saved to WordPress/)
  })

  test("a plain failure shows the backend's message", () => {
    setup({ errorInfo: { message: "Applying requires the Odito SEO Bridge plugin." } })
    expect(screen.getByRole("alert")).toHaveTextContent("Applying requires the Odito SEO Bridge plugin.")
  })

  test("a non-retryable error disables Apply", () => {
    setup({ errorInfo: { message: "No AI recommendation is linked.", nonRetryable: true } })
    type(field("LinkedIn"), LI)
    expect(applyButton()).toBeDisabled()
  })

  test("the lost-the-race case explains that WordPress may already have the change", () => {
    setup({ errorInfo: { message: "x", wordpressWriteSucceeded: true } })
    expect(screen.getByRole("alert")).toHaveTextContent(/may have already been applied/)
  })
})
