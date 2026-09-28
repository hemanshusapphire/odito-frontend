import { describe, test, expect, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import IssueRecommendationPanel from "./IssueRecommendationPanel"
import { FAQ_EXTRACTION_FAILED_MESSAGE } from "../issue-context/faqDetection"

// Monaco / the diff viewer / the loader are heavy and irrelevant here.
vi.mock("./RecommendationCodeBlock", () => ({ default: ({ content }) => <pre data-testid="code-block">{content}</pre> }))
vi.mock("./RecommendationDiffViewer", () => ({ default: () => null }))
vi.mock("./RecommendationLoadingState", () => ({ default: () => <div>loading</div> }))

const PAIRS = [{ question: "What is SEO?", answer: "Search engine optimization." }, { question: "Cost?", answer: "It depends." }]

const detection = (over = {}) => ({
  content: { detected: true, status: "extracted", pairCount: 2, pairs: PAIRS, warnings: [], message: null, ...over.content },
  schema: { detected: false, pairCount: 0, ...over.schema },
  schemaPreview: { format: "json-ld", jsonLd: "{}" },
  canGenerate: true,
  ...over.top,
})

const idle = { isIdle: true, isPending: false, isSuccess: false, isError: false }

function renderPanel(props) {
  return render(<IssueRecommendationPanel selUrl="https://example.com/faq" issue={{}} mutationState={idle} onGenerate={props.onGenerate ?? vi.fn()} {...props} />)
}

describe("IssueRecommendationPanel — FAQ schema issue", () => {
  test("extracted FAQ: offers 'Generate Schema from Detected FAQs' and says it only uses the detected questions", () => {
    const onGenerate = vi.fn()
    renderPanel({ faqDetection: detection(), onGenerate })

    const button = screen.getByRole("button", { name: /Generate Schema from Detected FAQs/ })
    expect(screen.getByText(/only from the 2 questions detected on this page — nothing is added or reworded/)).toBeInTheDocument()
    fireEvent.click(button)
    expect(onGenerate).toHaveBeenCalledTimes(1)
  })

  test("extraction failed: NO generate action at all, and the exact message is shown", () => {
    renderPanel({
      faqDetection: detection({
        content: { status: "extraction_failed", reason: "no_reliable_pairs", pairCount: 0, pairs: [], message: FAQ_EXTRACTION_FAILED_MESSAGE },
        top: { canGenerate: false, schemaPreview: null },
      }),
    })

    expect(screen.getByTestId("faq-generation-blocked")).toHaveTextContent(FAQ_EXTRACTION_FAILED_MESSAGE)
    expect(screen.queryByRole("button", { name: /Generate/ })).not.toBeInTheDocument()
  })

  test("a FAQPage schema already present: no generate action", () => {
    renderPanel({ faqDetection: detection({ schema: { detected: true, pairCount: 2 }, top: { canGenerate: false } }) })
    expect(screen.getByTestId("faq-generation-blocked")).toHaveTextContent(/already present/)
    expect(screen.queryByRole("button", { name: /Generate/ })).not.toBeInTheDocument()
  })

  test("any other issue (no faqDetection) is unchanged", () => {
    renderPanel({ faqDetection: null })
    expect(screen.getByRole("button", { name: "✦ Generate AI Recommendation" })).toBeInTheDocument()
    expect(screen.getByText(/context-aware remediation strategy/)).toBeInTheDocument()
  })

  test("a generated FAQ recommendation is presented as a schema preview (JSON-LD), without length/'valid range' chrome", () => {
    const jsonLd = JSON.stringify({ "@type": "FAQPage", mainEntity: [] }, null, 2)
    renderPanel({
      faqDetection: detection(),
      mutationState: {
        isIdle: false, isPending: false, isSuccess: true, isError: false,
        recommendation: {
          id: "rec-1", ruleId: "faq_schema", severity: "medium",
          sections: { whyThisMatters: "why", recommendedVersion: jsonLd },
          afterState: { measurement: { value: 123 }, satisfiesConstraint: false },
        },
      },
    })

    expect(screen.getByText("FAQPage Schema Preview")).toBeInTheDocument()
    expect(screen.getByTestId("code-block")).toHaveTextContent('"@type": "FAQPage"')
    expect(screen.queryByText("123 chars")).not.toBeInTheDocument()
    expect(screen.queryByText(/Check range/)).not.toBeInTheDocument()
  })
})
