import { describe, it, expect } from "vitest"
import {
  OTHER_PLATFORM,
  SOCIAL_PLATFORMS,
  detectPlatformId,
  groupUrlsByPlatform,
  platformMismatchWarning,
  urlMatchesPlatform,
} from "./socialPlatforms"

describe("SOCIAL_PLATFORMS — the configuration", () => {
  it("lists the seven common networks in display order, each with a label and a placeholder", () => {
    expect(SOCIAL_PLATFORMS.map((p) => p.id)).toEqual(["facebook", "instagram", "linkedin", "x", "youtube", "tiktok", "pinterest"])
    expect(SOCIAL_PLATFORMS.map((p) => p.label)).toEqual(["Facebook", "Instagram", "LinkedIn", "X / Twitter", "YouTube", "TikTok", "Pinterest"])
    for (const p of SOCIAL_PLATFORMS) {
      expect(p.placeholder).toMatch(/^https:\/\//)
      expect(p.domains.length).toBeGreaterThan(0)
    }
  })

  it("LinkedIn is not special: it is one entry among the rest, and Other exists separately", () => {
    expect(SOCIAL_PLATFORMS[0].id).not.toBe("linkedin")
    expect(OTHER_PLATFORM).toMatchObject({ id: "other", label: "Other / Custom Profile" })
    expect(SOCIAL_PLATFORMS.some((p) => p.id === "other")).toBe(false)
  })

  it("is frozen (no accidental runtime edits)", () => {
    expect(Object.isFrozen(SOCIAL_PLATFORMS)).toBe(true)
    expect(Object.isFrozen(OTHER_PLATFORM)).toBe(true)
  })
})

describe("detectPlatformId", () => {
  const cases = [
    ["https://www.facebook.com/naxonify", "facebook"],
    ["https://facebook.com/naxonify", "facebook"],
    ["https://m.facebook.com/naxonify", "facebook"],
    ["https://fb.me/naxonify", "facebook"],
    ["https://www.instagram.com/naxonify", "instagram"],
    ["https://www.linkedin.com/company/naxonify", "linkedin"],
    ["https://uk.linkedin.com/company/naxonify", "linkedin"],
    ["https://x.com/naxonify", "x"],
    ["https://twitter.com/naxonify", "x"],
    ["https://mobile.twitter.com/naxonify", "x"],
    ["https://www.youtube.com/@naxonify", "youtube"],
    ["https://youtu.be/abc", "youtube"],
    ["https://www.tiktok.com/@naxonify", "tiktok"],
    ["https://www.pinterest.com/naxonify", "pinterest"],
    ["https://www.pinterest.co.uk/naxonify", "pinterest"],
    ["https://pinterest.de/naxonify", "pinterest"],
    ["HTTPS://WWW.INSTAGRAM.COM/naxonify", "instagram"],
  ]
  for (const [url, id] of cases) {
    it(`${url} -> ${id}`, () => expect(detectPlatformId(url)).toBe(id))
  }

  it("unknown networks, look-alike hosts and non-URLs map to null (-> Other)", () => {
    for (const url of [
      "https://www.behance.net/naxonify",
      "https://mastodon.social/@naxonify",
      "https://notfacebook.com/naxonify",
      "https://facebook.com.evil.example/naxonify",
      "https://evil.example/facebook.com",
      "https://x.com.evil.example/a",
      "not a url",
      "javascript:alert(1)",
      "",
      null,
      undefined,
    ]) {
      expect(detectPlatformId(url)).toBeNull()
    }
  })
})

describe("urlMatchesPlatform / platformMismatchWarning — a non-blocking hint only", () => {
  it("no warning when the host belongs to the platform", () => {
    expect(urlMatchesPlatform("https://www.facebook.com/x", "facebook")).toBe(true)
    expect(platformMismatchWarning("facebook", "https://www.facebook.com/x")).toBeNull()
    expect(platformMismatchWarning("x", "https://twitter.com/x")).toBeNull()
  })

  it("Facebook field holding an Instagram URL -> the exact warning text, and the URL is not rejected", () => {
    expect(platformMismatchWarning("facebook", "https://instagram.com/naxonify")).toBe("This URL does not appear to be a Facebook URL. Please verify it.")
  })

  it("grammar per platform (a / an)", () => {
    expect(platformMismatchWarning("instagram", "https://x.com/a")).toBe("This URL does not appear to be an Instagram URL. Please verify it.")
    expect(platformMismatchWarning("x", "https://facebook.com/a")).toBe("This URL does not appear to be an X / Twitter URL. Please verify it.")
    expect(platformMismatchWarning("linkedin", "https://x.com/a")).toBe("This URL does not appear to be a LinkedIn URL. Please verify it.")
  })

  it("warns for a host that matches no known platform too", () => {
    expect(platformMismatchWarning("youtube", "https://example.com/channel")).toMatch(/does not appear to be a YouTube URL/)
  })

  it("never warns for Other / an unknown field id, or when there is no parseable URL to judge", () => {
    expect(platformMismatchWarning("other", "https://anything.example/x")).toBeNull()
    expect(platformMismatchWarning("nonsense", "https://x.com/a")).toBeNull()
    expect(platformMismatchWarning("facebook", "")).toBeNull()
    expect(platformMismatchWarning("facebook", "not a url")).toBeNull()
  })
})

describe("groupUrlsByPlatform — mapping saved profiles back to their field", () => {
  it("puts known URLs under their platform and unknown ones under other, preserving order", () => {
    const groups = groupUrlsByPlatform([
      "https://www.linkedin.com/company/naxonify",
      "https://www.behance.net/naxonify",
      "https://www.instagram.com/naxonify",
      "https://www.linkedin.com/company/naxonify-labs",
      "https://mastodon.social/@naxonify",
    ])
    expect(groups).toEqual({
      linkedin: ["https://www.linkedin.com/company/naxonify", "https://www.linkedin.com/company/naxonify-labs"],
      other: ["https://www.behance.net/naxonify", "https://mastodon.social/@naxonify"],
      instagram: ["https://www.instagram.com/naxonify"],
    })
  })

  it("empty and missing input", () => {
    expect(groupUrlsByPlatform([])).toEqual({})
    expect(groupUrlsByPlatform(undefined)).toEqual({})
  })
})
