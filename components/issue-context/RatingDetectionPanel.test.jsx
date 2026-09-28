import { describe, test, expect } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, within } from "@testing-library/react"
import RatingDetectionPanel from "./RatingDetectionPanel"
import CurrentStateRenderer from "./CurrentStateRenderer"
import { describeRatingGenerationBlock, formatRating, getRatingDetection, parseRatingJsonLd, RATING_UNAVAILABLE_MESSAGE } from "./ratingDetection"

const SERVICE = { types: ["Service"], id: "https://example.com/seo/#service", name: "SEO Service", hasAggregateRating: false, eligibleTarget: true, targetKind: "service" }
const PAGE = { types: ["WebPage"], id: "https://example.com/seo/#webpage", name: null, hasAggregateRating: false, eligibleTarget: false, targetKind: null }
const SELECTED = { ratingValue: 4.8, bestRating: 5, reviewCount: 127, source: "text", evidence: "Rated 4.8/5 based on 127 reviews" }

const JSON_LD = JSON.stringify({
  "@context": "https://schema.org", "@type": "Service", "@id": SERVICE.id, name: SERVICE.name,
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "127", bestRating: "5" },
}, null, 2)

const ready = (over = {}) => ({
  status: "ready", canGenerate: true, message: null, reason: null, warnings: [],
  detectedRatingData: { status: "extracted", reason: null, selected: SELECTED, candidates: [SELECTED] },
  existingSchemas: [PAGE, SERVICE],
  existingAggregateRating: { present: false, valid: false, source: null, count: 0 },
  targetSchemaType: "Service", target: { types: ["Service"], id: SERVICE.id, name: SERVICE.name, kind: "service" },
  missingSchemaFields: ["aggregateRating"],
  generatedSchema: { format: "json-ld", jsonLd: JSON_LD, mergeMode: "same_id_node" },
  ...over,
})

const unavailable = (reason = "no_reliable_rating") => ready({
  status: "rating_unavailable", canGenerate: false, message: RATING_UNAVAILABLE_MESSAGE, reason,
  detectedRatingData: { status: "unavailable", reason, selected: null, candidates: [] },
  target: null, targetSchemaType: null, generatedSchema: null, missingSchemaFields: ["ratingValue", "reviewCount", "aggregateRating"],
})

const expectedState = { description: "AggregateRating inside Product or Service schema (ratingValue, reviewCount)" }

describe("RatingDetectionPanel", () => {
  test("shows AggregateRating NOT DETECTED, the detected rating figures, the page text they came from, and the existing schema with the target marked", () => {
    render(<RatingDetectionPanel detection={ready()} expectedState={expectedState} />)

    expect(within(screen.getByTestId("aggregate-rating-status")).getByText("NOT DETECTED")).toBeInTheDocument()
    expect(screen.getByText("Detected Rating Data")).toBeInTheDocument()
    expect(within(screen.getByTestId("rating-value")).getByText("4.8")).toBeInTheDocument()
    expect(within(screen.getByTestId("rating-best")).getByText("5")).toBeInTheDocument()
    expect(within(screen.getByTestId("rating-review-count")).getByText("127")).toBeInTheDocument()
    expect(screen.queryByTestId("rating-rating-count")).not.toBeInTheDocument()
    expect(screen.getByTestId("rating-evidence")).toHaveTextContent("Rated 4.8/5 based on 127 reviews")

    const schemas = screen.getAllByTestId("existing-schema")
    expect(schemas).toHaveLength(2)
    expect(within(schemas[1]).getByText("rating attaches here")).toBeInTheDocument()
    expect(within(schemas[0]).queryByText("rating attaches here")).not.toBeInTheDocument()

    expect(screen.getByTestId("target-schema")).toHaveTextContent("Service")
    expect(screen.getByTestId("target-schema")).toHaveTextContent("SEO Service")
    expect(within(screen.getByTestId("missing-schema-fields")).getByText("aggregateRating")).toBeInTheDocument()
    expect(screen.getByText(/AggregateRating inside Product or Service schema/)).toBeInTheDocument()
    expect(screen.queryByTestId("rating-unavailable")).not.toBeInTheDocument()
  })

  test("a ratingCount-based rating shows ratingCount, not reviewCount", () => {
    const sel = { ratingValue: 4.7, bestRating: 5, ratingCount: 310, source: "text", evidence: "4.7 stars · 310 ratings" }
    render(<RatingDetectionPanel detection={ready({ detectedRatingData: { status: "extracted", selected: sel, candidates: [sel] } })} expectedState={expectedState} />)
    expect(within(screen.getByTestId("rating-rating-count")).getByText("310")).toBeInTheDocument()
    expect(screen.queryByTestId("rating-review-count")).not.toBeInTheDocument()
  })

  test("no reliable rating: the exact message, no invented figures, no target claim", () => {
    render(<RatingDetectionPanel detection={unavailable()} expectedState={expectedState} />)
    expect(screen.getByTestId("rating-unavailable")).toHaveTextContent(RATING_UNAVAILABLE_MESSAGE)
    expect(screen.queryByTestId("rating-value")).not.toBeInTheDocument()
    expect(screen.queryByTestId("rating-evidence")).not.toBeInTheDocument()
    expect(screen.queryByTestId("target-schema")).not.toBeInTheDocument()
    const missing = screen.getByTestId("missing-schema-fields")
    expect(within(missing).getByText("ratingValue")).toBeInTheDocument()
    expect(within(missing).getByText("reviewCount")).toBeInTheDocument()
  })

  test("a crawl that predates rating extraction gets a re-crawl hint", () => {
    render(<RatingDetectionPanel detection={unavailable("crawl_predates_extraction")} expectedState={expectedState} />)
    expect(screen.getByText(/Run a new crawl to refresh it/)).toBeInTheDocument()
  })

  test("conflicting ratings are listed and flagged, none is chosen", () => {
    const other = { ratingValue: 4.1, bestRating: 5, reviewCount: 30, source: "text", evidence: "4.1/5 (30 reviews)" }
    render(<RatingDetectionPanel detection={ready({ status: "rating_ambiguous", canGenerate: false, message: "ambiguous", detectedRatingData: { status: "ambiguous", selected: null, candidates: [SELECTED, other] }, generatedSchema: null })} expectedState={expectedState} />)
    const box = screen.getByTestId("rating-ambiguous")
    expect(box).toHaveTextContent("4.8 out of 5 from 127 reviews")
    expect(box).toHaveTextContent("4.1 out of 5 from 30 reviews")
    expect(screen.queryByTestId("rating-value")).not.toBeInTheDocument()
  })

  test("nothing to attach the rating to: says so, and names what is missing", () => {
    const msg = "No Product, Service, LocalBusiness or Organization schema exists on this page to attach the rating to."
    render(<RatingDetectionPanel detection={ready({ status: "no_target_schema", canGenerate: false, message: msg, target: null, targetSchemaType: null, generatedSchema: null, existingSchemas: [PAGE], missingSchemaFields: ["aggregateRating", "targetSchema"] })} expectedState={expectedState} />)
    expect(screen.getByTestId("rating-blocked-reason")).toHaveTextContent(msg)
    expect(within(screen.getByTestId("missing-schema-fields")).getByText("targetSchema")).toBeInTheDocument()
  })

  test("an existing AggregateRating is shown as DETECTED with its source", () => {
    render(<RatingDetectionPanel detection={ready({ status: "already_present", canGenerate: false, message: "This page already has AggregateRating markup.", existingAggregateRating: { present: true, valid: true, source: "microdata", count: 1 }, generatedSchema: null, missingSchemaFields: [] })} expectedState={expectedState} />)
    const row = screen.getByTestId("aggregate-rating-status")
    expect(within(row).getByText("DETECTED")).toBeInTheDocument()
    expect(row).toHaveTextContent("microdata")
  })

  test("an Organization/LocalBusiness target carries the honest self-serving note", () => {
    render(<RatingDetectionPanel detection={ready({ warnings: ["self_serving_target"], targetSchemaType: "Organization" })} expectedState={expectedState} />)
    expect(screen.getByTestId("rating-self-serving-warning")).toHaveTextContent(/don.t show star results for ratings a business gives about itself/)
  })

  test("no existing structured data at all", () => {
    render(<RatingDetectionPanel detection={ready({ existingSchemas: [], target: null })} expectedState={expectedState} />)
    expect(screen.getByText(/No structured data was found on this page/)).toBeInTheDocument()
  })
})

describe("CurrentStateRenderer — rating issue", () => {
  test("with ratingDetection: renders RatingDetectionPanel instead of the generic absent card", () => {
    render(<CurrentStateRenderer issueContext={{
      identity: { pipeline: "on_page" }, metadata: { readinessScore: 100 }, expectedState,
      currentState: { displayType: "absent", isAbsent: true, checkedFor: "AggregateRating schema" },
      ratingDetection: ready(),
    }} />)
    expect(screen.getByTestId("rating-detection-panel")).toBeInTheDocument()
    expect(screen.queryByText(/No AggregateRating schema was found on this page/)).not.toBeInTheDocument()
  })
})

describe("ratingDetection helpers", () => {
  test("getRatingDetection only returns a well-formed payload", () => {
    expect(getRatingDetection(null)).toBe(null)
    expect(getRatingDetection({ ratingDetection: {} })).toBe(null)
    expect(getRatingDetection({ ratingDetection: ready() })).toEqual(ready())
  })

  test("formatRating is built from the numbers only", () => {
    expect(formatRating(SELECTED)).toBe("4.8 out of 5 from 127 reviews")
    expect(formatRating({ ratingValue: 4, bestRating: 5, reviewCount: 1 })).toBe("4 out of 5 from 1 review")
    expect(formatRating({ ratingValue: 4.7, bestRating: 5, ratingCount: 310 })).toBe("4.7 out of 5 from 310 ratings")
    expect(formatRating(null)).toBe(null)
  })

  test("parseRatingJsonLd returns target + rating only for a well-formed rating node", () => {
    const parsed = parseRatingJsonLd(JSON_LD)
    expect(parsed.target).toEqual({ type: "Service", id: SERVICE.id, name: "SEO Service" })
    expect(parsed.rating).toMatchObject({ ratingValue: "4.8", bestRating: "5", reviewCount: 127 })
    expect(parseRatingJsonLd("nope")).toBe(null)
    expect(parseRatingJsonLd(JSON.stringify({ "@type": "Service", name: "x" }))).toBe(null)
    expect(parseRatingJsonLd(JSON.stringify({ ...JSON.parse(JSON_LD), aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8" } }))).toBe(null)
  })

  test("describeRatingGenerationBlock: allowed -> null; blocked -> the backend's own message", () => {
    expect(describeRatingGenerationBlock(ready())).toBe(null)
    expect(describeRatingGenerationBlock(null)).toBe(null)
    expect(describeRatingGenerationBlock(unavailable())).toMatchObject({ tone: "warning", message: RATING_UNAVAILABLE_MESSAGE, hint: null })
    expect(describeRatingGenerationBlock(unavailable("crawl_predates_extraction")).hint).toMatch(/Run a new crawl/)
    expect(describeRatingGenerationBlock(ready({ status: "already_present", canGenerate: false, message: "already" })).tone).toBe("info")
  })
})
