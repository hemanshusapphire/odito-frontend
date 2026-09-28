import { describe, test, expect, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import IssueRecommendationPanel from "./IssueRecommendationPanel"
import { RATING_UNAVAILABLE_MESSAGE } from "../issue-context/ratingDetection"

vi.mock("./RecommendationCodeBlock", () => ({ default: ({ content }) => <pre data-testid="code-block">{content}</pre> }))
vi.mock("./RecommendationDiffViewer", () => ({ default: () => null }))
vi.mock("./RecommendationLoadingState", () => ({ default: () => <div>loading</div> }))

const detection = (over = {}) => ({
  status: "ready", canGenerate: true, message: null, reason: null, warnings: [],
  detectedRatingData: { status: "extracted", selected: { ratingValue: 4.8, bestRating: 5, reviewCount: 127 }, candidates: [] },
  targetSchemaType: "Service",
  ...over,
})
const idle = { isIdle: true, isPending: false, isSuccess: false, isError: false }
const renderPanel = (props) => render(<IssueRecommendationPanel selUrl="https://example.com/seo" issue={{}} mutationState={idle} onGenerate={props.onGenerate ?? vi.fn()} {...props} />)

describe("IssueRecommendationPanel — AggregateRating issue", () => {
  test("ready: offers 'Generate Schema from Detected Rating' and says exactly what it is built from", () => {
    const onGenerate = vi.fn()
    renderPanel({ ratingDetection: detection(), onGenerate })
    fireEvent.click(screen.getByRole("button", { name: /Generate Schema from Detected Rating/ }))
    expect(onGenerate).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/only from the rating shown on this page \(4\.8 out of 5 from 127 reviews\) and the existing Service schema — nothing is estimated/)).toBeInTheDocument()
  })

  test("reliable rating data unavailable: NO generate action, the exact message is shown", () => {
    renderPanel({ ratingDetection: detection({ status: "rating_unavailable", canGenerate: false, message: RATING_UNAVAILABLE_MESSAGE, detectedRatingData: { status: "unavailable", selected: null, candidates: [] } }) })
    expect(screen.getByTestId("rating-generation-blocked")).toHaveTextContent(RATING_UNAVAILABLE_MESSAGE)
    expect(screen.queryByRole("button", { name: /Generate/ })).not.toBeInTheDocument()
  })

  test("no target schema / already present: no generate action", () => {
    renderPanel({ ratingDetection: detection({ status: "no_target_schema", canGenerate: false, message: "No Product, Service, LocalBusiness or Organization schema exists on this page to attach the rating to." }) })
    expect(screen.queryByRole("button", { name: /Generate/ })).not.toBeInTheDocument()
  })

  test("other issues are unchanged", () => {
    renderPanel({})
    expect(screen.getByRole("button", { name: "✦ Generate AI Recommendation" })).toBeInTheDocument()
  })

  test("a generated rating recommendation is presented as a 'Generated Schema Preview' without length chrome", () => {
    renderPanel({
      ratingDetection: detection(),
      mutationState: {
        isIdle: false, isPending: false, isSuccess: true, isError: false,
        recommendation: {
          id: "rec-1", ruleId: "aggregate_rating_schema", severity: "high",
          sections: { whyThisMatters: "why", recommendedVersion: '{ "@type": "Service" }' },
          afterState: { measurement: { value: 99 }, satisfiesConstraint: false },
        },
      },
    })
    expect(screen.getByText("Generated Schema Preview")).toBeInTheDocument()
    expect(screen.getByTestId("code-block")).toHaveTextContent('"@type": "Service"')
    expect(screen.queryByText("99 chars")).not.toBeInTheDocument()
    expect(screen.queryByText(/Check range/)).not.toBeInTheDocument()
  })
})
