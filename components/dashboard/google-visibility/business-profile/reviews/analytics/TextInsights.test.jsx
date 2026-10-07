import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'

import KeywordCloud, { keywordTone, cloudFontSize, mergeKeywordItems } from './KeywordCloud'
import ReviewThemes, { sortThemes } from './ReviewThemes'
import { kw, keywords, theme, themes } from './analyticsFixtures'

describe('Keyword Cloud', () => {
  it('chips carry the exact counts: words and phrases together, most-mentioned first', () => {
    render(<KeywordCloud keywords={keywords()} periodTotal={100} />)
    const chips = within(screen.getByRole('list', { name: 'Keyword counts' })).getAllByRole('button').map((b) => b.textContent)
    expect(chips).toEqual(['staff:60', 'waiting:42', 'doctor:40', 'cataract surgery:30', 'surgery:20', 'waiting time:12'])
    expect(screen.getByRole('button', { name: 'waiting, 42 reviews' })).toBeInTheDocument()
  })

  it('renders the packed word cloud: every word placed from the same data, bigger = more reviews', () => {
    render(<KeywordCloud keywords={keywords()} periodTotal={100} />)
    const svg = screen.getByTestId('word-cloud')
    const sizeOf = (term) => Number([...svg.querySelectorAll('text')].find((t) => t.textContent === term).getAttribute('font-size'))
    expect(sizeOf('staff')).toBeGreaterThan(sizeOf('doctor'))
    expect(sizeOf('doctor')).toBeGreaterThan(sizeOf('surgery'))
    expect(svg.querySelectorAll('text').length).toBe(6)
    // the cloud is a decorative rendering of the chips - screen readers use the chips
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('word-cloud-compact')).toHaveAttribute('aria-hidden', 'true')
  })

  it('clicking a chip shows its details: reviews and the positive / neutral / negative split', () => {
    render(<KeywordCloud keywords={keywords()} periodTotal={100} />)
    fireEvent.click(screen.getByRole('button', { name: 'waiting, 42 reviews' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('“waiting”')).toBeInTheDocument()
    expect(dialog).toHaveTextContent('Mentioned in 42 reviews')
    expect(within(dialog).getByText('Positive').closest('div')).toHaveTextContent('4')
    expect(within(dialog).getByText('Neutral').closest('div')).toHaveTextContent('5')
    expect(within(dialog).getByText('Negative').closest('div')).toHaveTextContent('33')
  })

  it('clicking a word inside the cloud opens the same details', () => {
    render(<KeywordCloud keywords={keywords()} periodTotal={100} />)
    const word = [...screen.getByTestId('word-cloud').querySelectorAll('text')].find((t) => t.textContent === 'staff')
    fireEvent.click(word)
    expect(within(screen.getByRole('dialog')).getByText('“staff”')).toBeInTheDocument()
  })

  it('the business-name exclusion is disclosed', () => {
    render(<KeywordCloud keywords={keywords()} periodTotal={100} />)
    expect(screen.getByText(/Your business name \(krishna, eye\) is left out/)).toBeInTheDocument()
  })

  it('merge + tone + size helpers', () => {
    expect(mergeKeywordItems(keywords())[0].term).toBe('staff')
    expect(keywordTone(kw('a', 10))).toBe('positive')
    expect(keywordTone(kw('a', 10, { positive: 7, neutral: 3, negative: 0 }))).toBe('mixed')
    expect(keywordTone(kw('a', 10, { positive: 6, neutral: 0, negative: 4 }))).toBe('negative')
    expect(cloudFontSize(5, 5, 5)).toBe(20)
    expect(cloudFontSize(100, 1, 100)).toBeGreaterThan(cloudFontSize(1, 1, 100))
  })

  it('empty: not enough review text -> message, no fake keywords', () => {
    render(<KeywordCloud keywords={keywords({ status: 'insufficient_text', words: [], phrases: [] })} periodTotal={2} />)
    expect(screen.getByText('Not enough review text to identify keywords.')).toBeInTheDocument()
    expect(screen.queryByTestId('word-cloud')).not.toBeInTheDocument()
  })

  it('empty: zero reviews in the period', () => {
    render(<KeywordCloud keywords={keywords()} periodTotal={0} />)
    expect(screen.getByText('No review insights available for this period.')).toBeInTheDocument()
  })

  it('error: insights unavailable -> clear message and a working Retry', () => {
    const onRetry = vi.fn()
    render(<KeywordCloud keywords={null} periodTotal={100} onRetry={onRetry} />)
    expect(screen.getByText('Unable to load review insights.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('a new range re-renders with the new data', () => {
    const { rerender } = render(<KeywordCloud keywords={keywords()} periodTotal={100} />)
    rerender(<KeywordCloud keywords={keywords({ words: [kw('parking', 9)], phrases: [] })} periodTotal={9} />)
    expect(screen.getByRole('button', { name: 'parking, 9 reviews' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /staff/ })).not.toBeInTheDocument()
  })
})

describe('Review themes', () => {
  it('renders topic, review count, share and sentiment for every theme', () => {
    render(<ReviewThemes themes={themes()} periodTotal={100} />)
    const cards = within(screen.getByRole('list', { name: 'Review themes' })).getAllByRole('listitem')
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveTextContent('Doctors')
    expect(cards[0]).toHaveTextContent('80.0% of reviews')
    expect(cards[0]).toHaveTextContent('97.5% positive')
  })

  it('a negative-led theme leads with its negative share', () => {
    render(<ReviewThemes themes={themes()} periodTotal={100} />)
    expect(screen.getByText('Waiting & Appointments').closest('li')).toHaveTextContent('78.6% negative')
  })

  it('shows the overall baseline in the header', () => {
    render(<ReviewThemes themes={themes()} periodTotal={100} />)
    expect(screen.getByText(/overall 90.0% positive, 7.0% negative/)).toBeInTheDocument()
  })

  it('sorting is client-side: most mentioned (default), most positive, most negative', () => {
    const order = () => within(screen.getByRole('list', { name: 'Review themes' })).getAllByRole('heading', { level: 4 }).map((h) => h.textContent)
    render(<ReviewThemes themes={themes()} periodTotal={100} />)
    expect(order()).toEqual(['Doctors', 'Staff & Team', 'Waiting & Appointments'])
    const pick = (name) => { const t = screen.getByRole('tab', { name }); fireEvent.mouseDown(t); fireEvent.click(t) }
    pick('Most negative')
    expect(order()).toEqual(['Waiting & Appointments', 'Staff & Team', 'Doctors'])
    pick('Most positive')
    expect(order()).toEqual(['Doctors', 'Staff & Team', 'Waiting & Appointments'])
  })

  it('sortThemes is pure and tie-breaks by mentions', () => {
    const items = [theme('a', 'A', 10, 5, 0, 5), theme('b', 'B', 20, 10, 0, 10)]
    const before = JSON.stringify(items)
    expect(sortThemes(items, 'negative').map((t) => t.id)).toEqual(['b', 'a'])
    expect(JSON.stringify(items)).toBe(before)
  })

  it('empty states and error', () => {
    const { rerender } = render(<ReviewThemes themes={themes({ status: 'no_themes', items: [] })} periodTotal={5} />)
    expect(screen.getByText('No recurring themes found for this period.')).toBeInTheDocument()
    expect(screen.queryByRole('tablist', { name: 'Sort themes' })).not.toBeInTheDocument()
    rerender(<ReviewThemes themes={themes()} periodTotal={0} />)
    expect(screen.getByText('No review insights available for this period.')).toBeInTheDocument()
    const onRetry = vi.fn()
    rerender(<ReviewThemes themes={null} periodTotal={100} onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
