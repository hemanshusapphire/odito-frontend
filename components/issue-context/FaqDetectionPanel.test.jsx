import { describe, test, expect } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"
import FaqDetectionPanel from "./FaqDetectionPanel"
import CurrentStateRenderer from "./CurrentStateRenderer"
import { describeFaqGenerationBlock, getFaqDetection, parseFaqJsonLd, FAQ_EXTRACTION_FAILED_MESSAGE } from "./faqDetection"

const PAIRS = [
  { question: "What is SEO?", answer: "SEO is the practice of improving search visibility." },
  { question: "How long does it take?", answer: "Usually three to six months." },
]

const extracted = (overrides = {}) => ({
  content: { detected: true, status: "extracted", reason: null, pairCount: PAIRS.length, pairs: PAIRS, heuristicQuestionCount: PAIRS.length, warnings: [], message: null, ...overrides.content },
  schema: { detected: false, pairCount: 0, ...overrides.schema },
  schemaPreview: { format: "json-ld", jsonLd: "{}" },
  canGenerate: true,
})

const failed = (reason = "no_reliable_pairs") => ({
  content: { detected: true, status: "extraction_failed", reason, pairCount: 0, pairs: [], heuristicQuestionCount: 0, warnings: [], message: FAQ_EXTRACTION_FAILED_MESSAGE },
  schema: { detected: false, pairCount: 0 },
  schemaPreview: null,
  canGenerate: false,
})

const expectedState = { description: "FAQPage JSON-LD schema matching visible FAQ content" }

describe("FaqDetectionPanel — content and schema are reported separately", () => {
  test("FAQ content DETECTED and FAQPage schema NOT DETECTED, with the detected questions AND answers shown", () => {
    render(<FaqDetectionPanel detection={extracted()} expectedState={expectedState} />)

    const content = screen.getByTestId("faq-content-status")
    expect(within(content).getByText("FAQ Content")).toBeInTheDocument()
    expect(within(content).getByText("DETECTED")).toBeInTheDocument()
    expect(within(content).getByText(/2 questions & answers/)).toBeInTheDocument()

    const schema = screen.getByTestId("faq-schema-status")
    expect(within(schema).getByText("FAQPage Schema")).toBeInTheDocument()
    expect(within(schema).getByText("NOT DETECTED")).toBeInTheDocument()

    const pairs = screen.getAllByTestId("faq-pair")
    expect(pairs).toHaveLength(2)
    expect(screen.getByText("What is SEO?")).toBeInTheDocument()
    expect(screen.getByText("SEO is the practice of improving search visibility.")).toBeInTheDocument()
    expect(screen.getByText(/Detected FAQs — will be converted into schema/)).toBeInTheDocument()
    expect(screen.getByText(/FAQPage JSON-LD schema matching visible FAQ content/)).toBeInTheDocument()
    // The misleading standalone message this panel replaces.
    expect(screen.queryByText(/No FAQPage schema was found on this page/)).not.toBeInTheDocument()
  })

  test("long answers are collapsed but can be expanded to the full, unaltered text", () => {
    const longAnswer = "Word ".repeat(80).trim()
    render(<FaqDetectionPanel detection={extracted({ content: { pairs: [{ question: "Long?", answer: longAnswer }], pairCount: 1 } })} expectedState={expectedState} />)

    expect(screen.queryByText(longAnswer)).not.toBeInTheDocument()
    fireEvent.click(screen.getByText("Show full answer"))
    expect(screen.getByText(longAnswer, { exact: false })).toBeInTheDocument()
  })

  test("more than 5 pairs: the rest is behind an explicit 'Show all N questions'", () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ question: `Question ${i + 1}?`, answer: `Answer ${i + 1}.` }))
    render(<FaqDetectionPanel detection={extracted({ content: { pairs: many, pairCount: 8 } })} expectedState={expectedState} />)

    expect(screen.getAllByTestId("faq-pair")).toHaveLength(5)
    fireEvent.click(screen.getByText("Show all 8 questions"))
    expect(screen.getAllByTestId("faq-pair")).toHaveLength(8)
  })

  test("extraction failure: exact message, no question list, and it says nothing will be generated", () => {
    render(<FaqDetectionPanel detection={failed()} expectedState={expectedState} />)

    expect(screen.getByTestId("faq-extraction-failed")).toHaveTextContent(FAQ_EXTRACTION_FAILED_MESSAGE)
    expect(screen.getByText(/No schema will be generated from content that cannot be read reliably/)).toBeInTheDocument()
    expect(screen.queryByTestId("faq-detected-pairs")).not.toBeInTheDocument()
    expect(screen.queryAllByTestId("faq-pair")).toHaveLength(0)
    // Content is still reported as detected — only the pairs are unavailable.
    expect(within(screen.getByTestId("faq-content-status")).getByText("DETECTED")).toBeInTheDocument()
  })

  test("a crawl that predates pair extraction gets a re-crawl hint", () => {
    render(<FaqDetectionPanel detection={failed("crawl_predates_extraction")} expectedState={expectedState} />)
    expect(screen.getByText(/Run a new crawl to refresh it/)).toBeInTheDocument()
  })

  test("an existing FAQPage schema is shown as DETECTED", () => {
    render(<FaqDetectionPanel detection={extracted({ schema: { detected: true, pairCount: 2 } })} expectedState={expectedState} />)
    expect(within(screen.getByTestId("faq-schema-status")).getByText("DETECTED")).toBeInTheDocument()
  })

  test("partial extraction is called out so the user reviews what will be included", () => {
    render(<FaqDetectionPanel detection={extracted({ content: { pairs: [PAIRS[0]], pairCount: 1, heuristicQuestionCount: 5, warnings: ["partial_extraction"] } })} expectedState={expectedState} />)
    expect(screen.getByText(/Only 1 of about 5 FAQ-style questions/)).toBeInTheDocument()
  })
})

describe("CurrentStateRenderer — faq_schema gets the FAQ panel, every other issue is unchanged", () => {
  const baseContext = {
    identity: { pipeline: "on_page" },
    currentState: { displayType: "absent", isAbsent: true, checkedFor: "FAQPage schema" },
    expectedState,
    metadata: { readinessScore: 100 },
  }

  test("with faqDetection: renders FaqDetectionPanel, not the generic absent card", () => {
    render(<CurrentStateRenderer issueContext={{ ...baseContext, faqDetection: extracted() }} />)
    expect(screen.getByTestId("faq-detection-panel")).toBeInTheDocument()
    expect(screen.getByText("What is SEO?")).toBeInTheDocument()
  })
})

describe("faqDetection helpers", () => {
  test("getFaqDetection only returns a well-formed payload", () => {
    expect(getFaqDetection(null)).toBe(null)
    expect(getFaqDetection({})).toBe(null)
    expect(getFaqDetection({ faqDetection: "nope" })).toBe(null)
    expect(getFaqDetection({ faqDetection: extracted() })).toEqual(extracted())
  })

  test("parseFaqJsonLd returns pairs only for a well-formed FAQPage", () => {
    const ok = JSON.stringify({ "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A" } }] })
    expect(parseFaqJsonLd(ok)).toEqual([{ question: "Q?", answer: "A" }])
    expect(parseFaqJsonLd("not json")).toBe(null)
    expect(parseFaqJsonLd(JSON.stringify({ "@type": "Article" }))).toBe(null)
    expect(parseFaqJsonLd(JSON.stringify({ "@type": "FAQPage", mainEntity: [{ name: "Q?" }] }))).toBe(null)
    expect(parseFaqJsonLd(null)).toBe(null)
  })

  test("describeFaqGenerationBlock: allowed -> null; failure -> warning with the exact message; existing schema -> info", () => {
    expect(describeFaqGenerationBlock(extracted())).toBe(null)
    expect(describeFaqGenerationBlock(failed())).toMatchObject({ tone: "warning", message: FAQ_EXTRACTION_FAILED_MESSAGE })
    expect(describeFaqGenerationBlock({ ...extracted({ schema: { detected: true } }), canGenerate: false })).toMatchObject({ tone: "info", message: expect.stringMatching(/already present/) })
    expect(describeFaqGenerationBlock(null)).toBe(null)
  })
})
