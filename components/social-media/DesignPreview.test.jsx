import React from 'react'
import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { DesignPreview } from './DesignPreview'

const URL = 'https://media.odito-test.example/design.png'

describe('DesignPreview — the whole design, and a click to see it large', () => {
  it('shows the design uncropped (contained, never cover) and is a button that says what a click does', () => {
    render(<DesignPreview src={URL} />)
    const image = screen.getByTestId('design-preview-image')
    expect(image).toHaveAttribute('src', URL)
    expect(image).toHaveAttribute('alt', 'Post design')
    expect(image.className).toMatch(/object-contain/)
    expect(image.className).not.toMatch(/object-cover|absolute/)
    expect(screen.getByRole('button', { name: 'View design full size' })).toBeInTheDocument()
    expect(screen.getByText('Click to enlarge')).toBeInTheDocument()
    expect(screen.queryByTestId('design-preview-dialog')).not.toBeInTheDocument()
  })

  it('a click opens a centered preview with the same image large; Escape closes it', async () => {
    render(<DesignPreview src={URL} />)
    fireEvent.click(screen.getByTestId('design-preview-button'))
    const dialog = await screen.findByTestId('design-preview-dialog')
    expect(screen.getByRole('dialog')).toBe(dialog)
    expect(dialog.className).toMatch(/left-\[50%\]/)
    const large = within(dialog).getByTestId('design-preview-large')
    expect(large).toHaveAttribute('src', URL)
    expect(large.className).toMatch(/max-h-\[85vh\]/)
    expect(large.className).toMatch(/object-contain/)
    expect(within(dialog).getByRole('link', { name: 'Open the original in a new tab' })).toHaveAttribute('href', URL)
    expect(within(dialog).getByRole('link', { name: 'Open the original in a new tab' })).toHaveAttribute('rel', 'noopener noreferrer')
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape', code: 'Escape' })
    await waitFor(() => expect(screen.queryByTestId('design-preview-dialog')).not.toBeInTheDocument())
  })

  it('the close button also closes it', async () => {
    render(<DesignPreview src={URL} />)
    fireEvent.click(screen.getByTestId('design-preview-button'))
    fireEvent.click(within(await screen.findByTestId('design-preview-dialog')).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByTestId('design-preview-dialog')).not.toBeInTheDocument())
  })

  it('a file that cannot load shows a neutral placeholder, not a broken image', () => {
    render(<DesignPreview src={URL} />)
    fireEvent.error(screen.getByTestId('design-preview-image'))
    expect(screen.getByTestId('design-preview-fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('design-preview-image')).not.toBeInTheDocument()
  })
})
