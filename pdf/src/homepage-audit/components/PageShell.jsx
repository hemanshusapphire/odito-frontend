import React, { useEffect } from 'react';
import theme from '../theme';
import BrandHeader from './BrandHeader';
import BrandNameHeader from './BrandNameHeader';

// Shared page container + brand header + PDF-readiness signal, previously
// copy-pasted verbatim into every homepage-audit PDF page. `brand="logo"`
// renders the icon+wordmark BrandHeader (cover page only); every other page
// uses the plain-text BrandNameHeader (the default).
export default function PageShell({ brand = 'name', children }) {
  useEffect(() => {
    window.__PDF_READY__ = true;
    return () => {
      window.__PDF_READY__ = false;
    };
  }, []);

  return (
    <div
      style={{
        width: theme.page.width,
        minHeight: theme.page.height,
        background: theme.color.background,
        padding: `${theme.page.marginTop}px ${theme.page.marginX}px`,
        boxSizing: 'border-box',
        fontFamily: theme.font.display,
      }}
    >
      {brand === 'logo' ? <BrandHeader /> : <BrandNameHeader />}
      {children}
    </div>
  );
}
