"use client";

import { useEffect, useState } from "react";

/**
 * Continuous quantity selector: a slider and a numeric input, always
 * synchronized to the same controlled `value`. Reusable beyond page packs
 * (nothing here knows about pricing or Stripe) — it just resolves a whole
 * number within [min, max] via either input method. Originally built for
 * "Buy More Pages"; "Buy Credits" (Phase 17) reuses this same component via
 * the `label`/`ariaLabel`/`unitSingular`/`unitPlural` props below instead
 * of a second near-identical slider — every prop defaults to its exact
 * original page-specific value, so BuyPagesModal's existing call site
 * (which passes none of them) renders identically to before.
 *
 * The numeric field is `type="text"` (not `type="number"`) so every
 * disallowed character — letters, symbols, decimals, minus signs,
 * scientific-notation "e" — is stripped as it's typed rather than merely
 * rejected on submit; this is what keeps typing feeling instant with no
 * possible invalid intermediate DOM value. Validity (range/empty) is
 * tracked separately so an in-progress edit (e.g. clearing the field to
 * retype) can show an inline message without ever pushing a bad number up
 * to the parent — the slider and summary only ever reflect the last valid
 * value.
 */
export default function PageSlider({
  min = 1,
  max = 5000,
  value,
  onChange,
  label = "Additional Pages",
  ariaLabel = "Additional pages",
  unitSingular = "page",
  unitPlural = "pages",
}) {
  const [inputValue, setInputValue] = useState(String(value));
  const [error, setError] = useState(null);

  // Reflects external changes to `value` (slider drags, parent resets on
  // modal reopen) into the text field — but only by way of a real `value`
  // change, so it never fights an in-progress keystroke in the input
  // itself (that path calls onChange directly, which is what changes
  // `value` in the first place).
  useEffect(() => {
    setInputValue(String(value));
    setError(null);
  }, [value]);

  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const handleSliderChange = (e) => {
    onChange(Number(e.target.value));
  };

  const handleInputChange = (e) => {
    // Strip everything but digits, then collapse leading zeros ("007" ->
    // "7") so the field never displays a non-canonical whole number.
    const digitsOnly = e.target.value.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
    setInputValue(digitsOnly);

    if (digitsOnly === '') {
      setError(`Enter a value between ${min} and ${max}`);
      return;
    }

    const parsed = Number(digitsOnly);
    if (parsed < min) {
      setError(`Minimum is ${min} ${min === 1 ? unitSingular : unitPlural}`);
      return;
    }
    if (parsed > max) {
      setError(`Maximum is ${max} ${unitPlural}`);
      return;
    }

    setError(null);
    onChange(parsed);
  };

  const handleInputBlur = () => {
    // Never leave the field empty/invalid once the user looks away —
    // snap back to the last valid value instead.
    const parsed = Number(inputValue);
    if (inputValue === '' || parsed < min || parsed > max) {
      setInputValue(String(value));
      setError(null);
    }
  };

  return (
    <div className="page-slider">
      <div className="page-slider-label">{label}</div>

      <div className="page-slider-row">
        <div
          className="page-slider-track"
          style={{ background: `linear-gradient(to right, #7c3aed ${percent}%, #00e5ff ${percent}%, var(--b, rgba(255,255,255,0.1)) ${percent}%)` }}
        >
          <input
            type="range"
            className="page-slider-input"
            min={min}
            max={max}
            step={1}
            value={value}
            onChange={handleSliderChange}
            aria-label={ariaLabel}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={`${value} ${unitPlural}`}
          />
        </div>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className={`page-slider-number-input${error ? ' page-slider-number-input-error' : ''}`}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={`Enter ${unitPlural}`}
          aria-label={`${ariaLabel} (numeric input)`}
        />
      </div>

      {error && <div className="page-slider-error">{error}</div>}

      <style>{`
        .page-slider { width: 100%; }

        .page-slider-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: var(--text3, #8b8b9a);
          margin-bottom: 12px;
        }

        .page-slider-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .page-slider-track {
          position: relative;
          flex: 1;
          height: 8px;
          border-radius: 999px;
          transition: background 0.1s linear;
        }

        .page-slider-input {
          -webkit-appearance: none;
          appearance: none;
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          width: 100%;
          height: 28px;
          background: transparent;
          margin: 0;
          cursor: pointer;
        }

        .page-slider-input:focus-visible {
          outline: 2px solid #00e5ff;
          outline-offset: 4px;
          border-radius: 999px;
        }

        .page-slider-input::-webkit-slider-runnable-track {
          -webkit-appearance: none;
          height: 8px;
          background: transparent;
        }

        .page-slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          margin-top: -7px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #00e5ff);
          border: 3px solid rgba(10,10,15,0.9);
          box-shadow: 0 0 0 0 rgba(124,58,237,0.4);
          transition: box-shadow 0.15s ease, transform 0.1s ease;
        }

        .page-slider-input:hover::-webkit-slider-thumb {
          box-shadow: 0 0 0 8px rgba(124,58,237,0.2);
        }

        .page-slider-input:active::-webkit-slider-thumb {
          transform: scale(1.12);
          box-shadow: 0 0 0 10px rgba(124,58,237,0.25);
        }

        .page-slider-input::-moz-range-track {
          height: 8px;
          background: transparent;
        }

        .page-slider-input::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #00e5ff);
          border: 3px solid rgba(10,10,15,0.9);
          box-shadow: 0 0 0 0 rgba(124,58,237,0.4);
          transition: box-shadow 0.15s ease, transform 0.1s ease;
        }

        .page-slider-input:hover::-moz-range-thumb {
          box-shadow: 0 0 0 8px rgba(124,58,237,0.2);
        }

        .page-slider-number-input {
          width: 92px;
          flex-shrink: 0;
          padding: 9px 10px;
          border-radius: 8px;
          border: 1px solid var(--b2, rgba(255,255,255,0.14));
          background: var(--s2, rgba(255,255,255,0.04));
          color: var(--text, #fff);
          font-size: 14px;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .page-slider-number-input::placeholder {
          color: var(--text3, #8b8b9a);
          font-weight: 500;
        }

        .page-slider-number-input:focus {
          border-color: #00e5ff;
          background: rgba(0,229,255,0.06);
        }

        .page-slider-number-input-error {
          border-color: #ef4444;
        }

        .page-slider-error {
          margin-top: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #ef4444;
        }

        @media (max-width: 480px) {
          .page-slider-number-input { width: 76px; font-size: 13px; }
        }
      `}</style>
    </div>
  );
}
