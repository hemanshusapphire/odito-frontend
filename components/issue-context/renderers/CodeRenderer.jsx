"use client"

import React, { useState } from 'react'

/**
 * CodeRenderer
 *
 * Renders a code block (JSON-LD, HTML, text rules) with a copy button.
 * Uses a dark monospace block to match the premium dark theme.
 *
 * currentState.formattedValue: { code: string, language: string }
 */
export default function CodeRenderer({ currentState }) {
  const [copied, setCopied] = useState(false)
  const { formattedValue, isAbsent, rawValue } = currentState
  const code = formattedValue?.code || (typeof rawValue === 'string' ? rawValue : '')
  const language = formattedValue?.language || 'text'

  if (isAbsent || !code) {
    return (
      <div style={{
        padding: '12px 14px',
        background: 'var(--color-status-error-surface)',
        border: '1px solid var(--color-status-error-border)',
        borderRadius: 10,
        color: 'var(--re)',
        fontSize: 12,
      }}>
        No code detected on this page
      </div>
    )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.03)',
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: 'DM Mono, monospace',
        }}>
          {language}
        </span>
        <button
          onClick={handleCopy}
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: copied ? '#00dfff' : 'rgba(255,255,255,0.4)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: 5,
            transition: 'color 0.2s',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Code content */}
      <pre style={{
        margin: 0,
        padding: '14px 16px',
        fontFamily: 'DM Mono, Consolas, Monaco, monospace',
        fontSize: 12,
        lineHeight: 1.65,
        color: '#e6edf3',
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        maxHeight: 320,
        overflowY: 'auto',
      }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}
