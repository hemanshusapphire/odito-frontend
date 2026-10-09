import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PostComposerDialog from './PostComposerDialog'
import apiService from '@/lib/apiService'

vi.mock('@/lib/apiService', () => ({
  default: {
    uploadBusinessProfilePostMedia: vi.fn(),
    deleteBusinessProfilePostMedia: vi.fn(),
  }
}))

if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = vi.fn(() => 'blob:mock-image-preview')
if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = vi.fn()

describe('PostComposerDialog & PostImageUploader', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    post: null,
    projectId: 'proj-123',
    onSubmit: vi.fn(),
    isSubmitting: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders post image dropzone when no image is attached', () => {
    render(<PostComposerDialog {...defaultProps} />)

    expect(screen.getByText(/Post Image \(optional\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Click to upload an image or drag & drop/i)).toBeInTheDocument()
    expect(screen.getByText(/Supports JPG, PNG, or WEBP up to 8MB/i)).toBeInTheDocument()
    // Old manual photo url input should no longer exist
    expect(screen.queryByPlaceholderText('https://example.com/image.jpg')).not.toBeInTheDocument()
  })

  it('rejects files with invalid file types and displays error banner', async () => {
    render(<PostComposerDialog {...defaultProps} />)

    const fileInput = screen.getByTestId('post-image-file-input')
    const invalidFile = new File(['dummy'], 'document.pdf', { type: 'application/pdf' })

    fireEvent.change(fileInput, { target: { files: [invalidFile] } })

    expect(await screen.findByText(/Only JPG, PNG, and WEBP image files are supported/i)).toBeInTheDocument()
    expect(apiService.uploadBusinessProfilePostMedia).not.toHaveBeenCalled()
  })

  it('rejects files exceeding the 8MB limit and displays error banner', async () => {
    render(<PostComposerDialog {...defaultProps} />)

    const fileInput = screen.getByTestId('post-image-file-input')
    const largeFile = new File([new Uint8Array(9 * 1024 * 1024)], 'giant.jpg', { type: 'image/jpeg' })

    fireEvent.change(fileInput, { target: { files: [largeFile] } })

    expect(await screen.findByText(/Image size exceeds the 8MB limit/i)).toBeInTheDocument()
    expect(apiService.uploadBusinessProfilePostMedia).not.toHaveBeenCalled()
  })

  it('successfully uploads valid image and includes mediaUrl in submit payload', async () => {
    apiService.uploadBusinessProfilePostMedia.mockResolvedValueOnce({
      success: true,
      data: {
        url: 'https://odito.com/storage/business_profile_posts/proj-123/banner.jpg',
        filename: 'banner.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
        width: 800,
        height: 600
      }
    })

    const handleSubmit = vi.fn()
    render(<PostComposerDialog {...defaultProps} onSubmit={handleSubmit} />)

    const fileInput = screen.getByTestId('post-image-file-input')
    const validFile = new File(['valid-image-bytes'], 'banner.jpg', { type: 'image/jpeg' })

    fireEvent.change(fileInput, { target: { files: [validFile] } })

    expect(apiService.uploadBusinessProfilePostMedia).toHaveBeenCalledWith(
      'proj-123',
      validFile,
      expect.any(Function)
    )

    // Verify ready status and thumbnail
    expect(await screen.findByText(/Ready to publish/i)).toBeInTheDocument()
    expect(screen.getByText('banner.jpg')).toBeInTheDocument()

    // Fill in required summary
    const summaryInput = screen.getByPlaceholderText(/What's new with your business/i)
    fireEvent.change(summaryInput, { target: { value: 'Exciting grand opening this weekend!' } })

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Publish to Google/i })
    fireEvent.click(submitBtn)

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: 'Exciting grand opening this weekend!',
        mediaUrl: 'https://odito.com/storage/business_profile_posts/proj-123/banner.jpg',
        topicType: 'STANDARD'
      })
    )
  })

  it('handles upload errors and provides retry button', async () => {
    apiService.uploadBusinessProfilePostMedia.mockRejectedValueOnce(
      new Error('Upload failed due to network timeout.')
    )

    render(<PostComposerDialog {...defaultProps} />)

    const fileInput = screen.getByTestId('post-image-file-input')
    const validFile = new File(['bytes'], 'failed.png', { type: 'image/png' })

    fireEvent.change(fileInput, { target: { files: [validFile] } })

    expect(await screen.findByText(/Upload failed due to network timeout/i)).toBeInTheDocument()

    const retryBtn = screen.getByRole('button', { name: /Retry Upload/i })
    expect(retryBtn).toBeInTheDocument()

    apiService.uploadBusinessProfilePostMedia.mockResolvedValueOnce({
      success: true,
      data: { url: 'https://odito.com/storage/business_profile_posts/proj-123/failed.png' }
    })

    fireEvent.click(retryBtn)
    expect(await screen.findByText(/Ready to publish/i)).toBeInTheDocument()
  })

  it('allows removing an attached image', async () => {
    apiService.uploadBusinessProfilePostMedia.mockResolvedValueOnce({
      success: true,
      data: { url: 'https://odito.com/storage/business_profile_posts/proj-123/remove-me.jpg' }
    })

    render(<PostComposerDialog {...defaultProps} />)

    const fileInput = screen.getByTestId('post-image-file-input')
    const validFile = new File(['bytes'], 'remove-me.jpg', { type: 'image/jpeg' })

    fireEvent.change(fileInput, { target: { files: [validFile] } })
    expect(await screen.findByText('remove-me.jpg')).toBeInTheDocument()

    const removeBtn = screen.getByRole('button', { name: /Remove/i })
    fireEvent.click(removeBtn)

    // Should return to dropzone state
    expect(screen.getByText(/Click to upload an image or drag & drop/i)).toBeInTheDocument()
    expect(screen.queryByText('remove-me.jpg')).not.toBeInTheDocument()
  })

  it('renders existing image when editing a post', () => {
    const existingPost = {
      google_post_id: 'post_abc',
      summary: 'Post with existing image',
      topic_type: 'STANDARD',
      media: [{ google_url: 'https://lh3.googleusercontent.com/test-existing.jpg' }]
    }

    render(<PostComposerDialog {...defaultProps} post={existingPost} />)

    expect(screen.getByText(/Save Changes/i)).toBeInTheDocument()
    expect(screen.getByAltText(/Post attachment preview/i)).toHaveAttribute(
      'src',
      'https://lh3.googleusercontent.com/test-existing.jpg'
    )
    expect(screen.getByRole('button', { name: /Change Image/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Remove/i })).toBeInTheDocument()
  })
})
