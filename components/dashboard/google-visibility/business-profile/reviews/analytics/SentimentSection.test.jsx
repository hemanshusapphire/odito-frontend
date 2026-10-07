import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, within } from '@testing-library/react'

vi.mock('recharts', async (orig) => {
  const actual = await orig()
  return { ...actual, ResponsiveContainer: () => <div data-testid="chart" /> }
})

import SentimentSection from './SentimentSection'
import { netSentiment, dominantSentiment } from './analyticsFormat'
import { payload } from './analyticsFixtures'

const sentiment = (period, over = {}) => ({
  ...payload().sentiment,
  period: { total: 0, positive: 0, neutral: 0, negative: 0, positivePercent: 0, neutralPercent: 0, negativePercent: 0, ...period },
  ...over,
})
const mk = (positive, neutral, negative) => {
  const total = positive + neutral + negative
  const p = (n) => Math.round((n / total) * 10000) / 100
  return { total, positive, neutral, negative, positivePercent: p(positive), neutralPercent: p(neutral), negativePercent: p(negative) }
}

describe('net sentiment helpers', () => {
  it('score = % positive - % negative; null without reviews', () => {
    expect(netSentiment(mk(96, 0, 4))).toBe(92)
    expect(netSentiment(mk(1, 1, 1))).toBe(0)
    expect(netSentiment(mk(0, 0, 5))).toBe(-100)
    expect(netSentiment({ total: 0 })).toBeNull()
    expect(netSentiment(undefined)).toBeNull()
  })
  it('dominant class, ties favour positive then neutral', () => {
    expect(dominantSentiment(mk(10, 2, 1))).toBe('positive')
    expect(dominantSentiment(mk(1, 5, 2))).toBe('neutral')
    expect(dominantSentiment(mk(1, 1, 8))).toBe('negative')
    expect(dominantSentiment(mk(2, 2, 2))).toBe('positive')
    expect(dominantSentiment({ total: 0 })).toBeNull()
  })
})

describe('Review Sentiment Score + Sentiment Timeline', () => {
  it('shows the score and the three shares from the existing sentiment model', () => {
    render(<SentimentSection sentiment={sentiment(mk(96, 1, 3))} unit="day" />)
    expect(screen.getByRole('heading', { name: 'Review Sentiment Score' })).toBeInTheDocument()
    expect(screen.getByText(/Current Score:/).textContent).toBe('Current Score: 93.00')
    const shares = within(screen.getByRole('list', { name: 'Sentiment shares' })).getAllByRole('listitem')
    expect(shares.map((s) => s.textContent.replace(/\d+ reviews$/, ''))).toEqual(['3.0%Negative', '1.0%Neutral', '96.0%Positive'])
  })

  it('is not an NPS and says how sentiment is decided', () => {
    render(<SentimentSection sentiment={sentiment(mk(96, 1, 3))} unit="day" />)
    expect(screen.queryByText(/NPS/)).not.toBeInTheDocument()
    expect(screen.getByText(/Score = % positive − % negative/)).toBeInTheDocument()
    expect(screen.getByText(/Based on star rating: 4–5★ positive, 3★ neutral, 1–2★ negative/)).toBeInTheDocument()
  })

  it('reports analysed labels when some exist', () => {
    render(<SentimentSection sentiment={sentiment(mk(8, 1, 1), { basis: { storedLabels: 40, derivedFromRating: 10 } })} unit="day" />)
    expect(screen.getByText(/40 reviews use an analysed label; the rest follow star rating/)).toBeInTheDocument()
  })

  it('the pointer label stays inside the card even at an extreme score; the arrow keeps the exact position', () => {
    render(<SentimentSection sentiment={sentiment(mk(100, 0, 0))} unit="day" />)
    const label = screen.getByText('Positive', { selector: 'span' })
    expect(parseFloat(label.style.left)).toBeLessThanOrEqual(88)
    const arrow = screen.getByText('▼')
    expect(parseFloat(arrow.style.left)).toBe(100) // net +100 sits at the far right of the bar
  })

  it('a mostly-negative period is labelled negative with its own colour logic', () => {
    render(<SentimentSection sentiment={sentiment(mk(1, 1, 8))} unit="day" />)
    expect(screen.getByText(/Current Score:/).textContent).toBe('Current Score: -70.00')
    expect(screen.getAllByText('Negative').length).toBeGreaterThan(0)
  })

  it('no reviews in the period: both halves say so (no 0% faces)', () => {
    render(<SentimentSection sentiment={sentiment({})} unit="day" />)
    expect(screen.getAllByText('No reviews available for this period.')).toHaveLength(2)
    expect(screen.queryByText(/Current Score/)).not.toBeInTheDocument()
  })

  it('the timeline half renders its legend (Positive, Negative, Neutral) and chart', () => {
    render(<SentimentSection sentiment={sentiment(mk(96, 1, 3))} unit="day" />)
    expect(screen.getByRole('heading', { name: 'Sentiment Timeline' })).toBeInTheDocument()
    const legend = screen.getByRole('list', { name: 'Legend' })
    expect(within(legend).getAllByRole('listitem').map((l) => l.textContent)).toEqual(['Positive', 'Negative', 'Neutral'])
    expect(screen.getByTestId('chart')).toBeInTheDocument()
  })
})
