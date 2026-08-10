"use client";

/**
 * Shared responsive button row for onboarding chat CTAs (keyword confirm,
 * target level, website fallback, upgrade, subscription-activated, ...).
 * Wraps naturally on narrow rows and stacks fully on mobile via
 * .chat-button-group / .chat-button in chat.css — consolidates what used
 * to be five near-identical inline-styled button blocks in ARIAChat.jsx.
 *
 * buttons: [{ key, label, icon, variant: 'primary'|'secondary'|'success', onClick, disabled }]
 */
export default function ButtonGroup({ buttons, stack = false }) {
  return (
    <div className={`chat-button-group${stack ? ' stack' : ''}`}>
      {buttons.map(({ key, label, icon, variant = 'secondary', onClick, disabled }) => (
        <button
          key={key ?? label}
          onClick={onClick}
          disabled={disabled}
          className={`chat-button chat-button--${variant}`}
        >
          {icon && <span>{icon}</span>}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
