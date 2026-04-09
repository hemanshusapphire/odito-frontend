'use client';

import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// NEW APPROACH: Full HTML template for iframe - exact same as localhost:3001
const PDF_HTML_TEMPLATE = (pageContent, pageIndex) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Odito AI Report - Page ${pageIndex + 1}</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap" rel="stylesheet" />
  
  <!-- PDF Ready System - Initialize in PARENT window -->
  <script>
    /**
     * Global PDF Ready Signal System
     * 
     * CRITICAL: Initialize in PARENT window, not iframe!
     * Components and renderer expect it in parent context.
     */
    (function() {
      'use strict';

      // Determine target window (parent for iframe, current for standalone)
      const targetWindow = window.parent && window.parent !== window ? window.parent : window;
      
      // Only initialize once
      if (targetWindow.__PDF_READY__) {
        console.log('[PDF READY] 🔄 System already exists in target window');
        return;
      }

      // Initialize PDF Ready System in target window
      targetWindow.__PDF_READY__ = {
        components: {},
        
        register: function(name) {
          if (!this.components[name]) {
            this.components[name] = { ready: false };
          }
          console.log('[PDF READY] 📝 ' + name + ' registered');
        },
        
        markReady: function(name) {
          if (!this.components[name]) {
            this.components[name] = {};
          }
          this.components[name].ready = true;
          console.log('[PDF READY] ✅ ' + name + ' marked ready');
          
          // Check if all components are ready
          if (this.isAllReady()) {
            console.log('[PDF READY] 🎉 ALL COMPONENTS READY - PDF can be generated');
            targetWindow.__PDF_ALL_READY__ = true;
          }
        },
        
        isAllReady: function() {
          return Object.values(this.components).every(c => c.ready);
        },
        
        getStatus: function() {
          const componentList = Object.entries(this.components).map(([id, comp]) => ({
            id: id,
            name: id,
            ready: comp.ready
          }));
          
          const readyCount = componentList.filter(c => c.ready).length;
          const totalCount = componentList.length;
          
          return {
            allReady: this.isAllReady(),
            readyCount: readyCount,
            totalCount: totalCount,
            components: componentList
          };
        },
        
        reset: function() {
          this.components = {};
          targetWindow.__PDF_ALL_READY__ = false;
          console.log('[PDF READY] 🔄 Reset - Ready for new PDF generation');
        }
      };

      // Initialize global flag
      targetWindow.__PDF_ALL_READY__ = false;
      
      // Debug logs
      console.log('[PDF READY] 🚀 Initialized in CORRECT window');
      console.log('[PDF READY] 📍 iframe:', !!window.__PDF_READY__);
      console.log('[PDF READY] 📍 parent:', !!window.parent.__PDF_READY__);
      
      // Legacy compatibility - expose old API
      targetWindow.__PDF_REGISTER_COMPONENT__ = function(id, name) {
        targetWindow.__PDF_READY__.register(name || id);
      };
      
      targetWindow.__PDF_SET_READY__ = function(id, ready, name) {
        if (ready) {
          targetWindow.__PDF_READY__.markReady(name || id);
        }
      };
      
      targetWindow.__PDF_GET_STATUS__ = function() {
        return targetWindow.__PDF_READY__.getStatus();
      };
      
      targetWindow.__PDF_RESET_READY__ = function() {
        targetWindow.__PDF_READY__.reset();
      };
    })();
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

    :root {
      --bg-dark: #070B1A;
      --bg-card: #0F1428;
      --bg-card2: #111830;
      --bg-section: #0D1235;
      --accent-blue: #4F6EF7;
      --accent-cyan: #00D4FF;
      --accent-purple: #7B5CF0;
      --text-primary: #FFFFFF;
      --text-secondary: #8892C4;
      --text-muted: #4A5280;
      --border: rgba(79,110,247,0.2);
      --border-light: rgba(255,255,255,0.07);
      --red: #FF5A5A;
      --orange: #FF9C41;
      --yellow: #FFD166;
      --green: #2DD4A0;
      --blue-light: #60A5FA;

      /* Light page vars */
      --page-bg: #FFFFFF;
      --page-text: #111827;
      --page-muted: #6B7280;
      --page-border: #E5E7EB;
      --page-card: #F9FAFB;
      --page-header-bg: #111827;
      
      /* Font families */
      --font-display: 'Syne', system-ui, -apple-system, 'Segoe UI', sans-serif;
      --font-body: 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
    }

    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0;
      font-family: var(--font-body) !important;
    }

    html, body {
      font-family: var(--font-body);
      background: #fff;
      color: #111827;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-display);
    }

    /* Ensure all text elements use the correct fonts */
    p, span, div, a, button, label, input, textarea, select {
      font-family: var(--font-body);
    }

    button, input, textarea, select {
      font-family: var(--font-body);
    }

    /* Font-loaded classes for conditional letter-spacing */
    .font-loaded .letter-spacing-neg1 { letter-spacing: -1px; }
    .font-loaded .letter-spacing-neg10 { letter-spacing: -10px; }
    .font-loaded .letter-spacing-1 { letter-spacing: 1px; }
    .font-loaded .letter-spacing-2 { letter-spacing: 2px; }

    body {
      margin: 0;
      padding: 0;
      background: #fff;
    }
  </style>
</head>
<body>
  <div id="root" class="font-loaded">
    ${pageContent}
  </div>
</body>
</html>
`;

/**
 * Add inline component registration and ready calls to HTML
 */
function addInlineComponentRegistration(pageContent, pageIndex) {
  // Define component mappings based on page index
  const componentMap = {
    0: { id: 'cover-page', name: 'Cover Page' },
    1: { id: 'section-divider-2', name: 'Section Divider - Executive Summary' },
    2: { id: 'executive-summary', name: 'Executive Summary' },
    3: { id: 'key-strengths', name: 'Key Strengths' },
    4: { id: 'priority-roadmap', name: 'Priority Roadmap' },
    5: { id: 'seo-health-overview', name: 'SEO Health Overview' },
    6: { id: 'section-divider-7', name: 'Section Divider - SEO Audit' },
    7: { id: 'on-page-seo', name: 'On Page SEO' },
    8: { id: 'structured-data', name: 'Structured Data' },
    9: { id: 'technical-seo', name: 'Technical SEO' },
    10: { id: 'crawlability', name: 'Crawlability' },
    11: { id: 'section-divider-12', name: 'Section Divider - Performance' },
    12: { id: 'core-web-vitals', name: 'Core Web Vitals' },
    13: { id: 'performance-opportunities', name: 'Performance Opportunities' },
    14: { id: 'section-divider-15', name: 'Section Divider - Keywords' },
    15: { id: 'keyword-ranking', name: 'Keyword Ranking' },
    16: { id: 'keyword-opportunity', name: 'Keyword Opportunity' },
    17: { id: 'section-divider-18', name: 'Section Divider - AI Visibility' },
    18: { id: 'ai-visibility-overview', name: 'AI Visibility Overview' },
    19: { id: 'llm-visibility', name: 'LLM Visibility' },
    20: { id: 'llm-citation-forecast', name: 'LLM Citation Forecast' },
    21: { id: 'ai-content-readiness', name: 'AI Content Readiness' },
    22: { id: 'ai-content-strategy', name: 'AI Content Strategy' },
    23: { id: 'knowledge-graph', name: 'Knowledge Graph' },
    24: { id: 'section-divider-25', name: 'Section Divider - Action Plan' },
    25: { id: 'ai-optimisation', name: 'AI Optimisation' },
    26: { id: 'ai-growth-forecast', name: 'AI Growth Forecast' },
    27: { id: 'action-plan', name: 'Action Plan' },
    28: { id: 'audit-methodology', name: 'Audit Methodology' },
    29: { id: 'about-odito', name: 'About Odito' }
  };

  const component = componentMap[pageIndex];
  if (!component) {
    console.warn(`[PDF RENDERER] No component mapping for page ${pageIndex}`);
    return pageContent;
  }

  // Add inline registration and ready script at the beginning of the content
  const inlineScript = `
    <script>
      (function() {
        // Helper to get correct PDF window (parent for iframe context)
        var getPDFWindow = function() {
          return window.parent && window.parent !== window ? window.parent : window;
        };
        
        var pdfWindow = getPDFWindow();
        console.log('[PDF INLINE] Registering component: ${component.name} in parent window context');
        
        // Debug: Check if system exists
        console.log('[PDF INLINE] 📍 System check - parent has __PDF_READY__:', !!pdfWindow.__PDF_READY__);
        
        if (pdfWindow.__PDF_READY__) {
          pdfWindow.__PDF_READY__.register('${component.name}');
        } else if (pdfWindow.__PDF_REGISTER_COMPONENT__) {
          pdfWindow.__PDF_REGISTER_COMPONENT__('${component.id}', '${component.name}');
        } else {
          console.error('[PDF INLINE] ❌ Registration function not available in parent window');
        }
        
        // For pages that don't fetch data, mark as ready immediately
        // For pages that fetch data, they'll call SET_READY when done
        var needsDataFetch = ${pageIndex === 0 || pageIndex === 2 || pageIndex === 5 || pageIndex === 7 || pageIndex === 8 || pageIndex === 9 || pageIndex === 10 || pageIndex === 12 || pageIndex === 15 || pageIndex === 16 || pageIndex === 18 || pageIndex === 21 || pageIndex === 22 || pageIndex === 25 || pageIndex === 26 || pageIndex === 27 ? 'true' : 'false'};
        
        if (!needsDataFetch) {
          console.log('[PDF INLINE] Marking component as ready (no data fetch needed): ${component.name}');
          if (pdfWindow.__PDF_READY__) {
            pdfWindow.__PDF_READY__.markReady('${component.name}');
          } else if (pdfWindow.__PDF_SET_READY__) {
            pdfWindow.__PDF_SET_READY__('${component.id}', true, '${component.name}');
          } else {
            console.error('[PDF INLINE] ❌ Ready function not available in parent window');
          }
        } else {
          console.log('[PDF INLINE] Component will mark itself as ready after data fetch: ${component.name}');
        }
      })();
    </script>
  `;

  return inlineScript + pageContent;
}

/**
 * Utility for rendering React components to PDF
 */
export class PDFRenderer {
  constructor() {
    this.container = null;
    this.pdf = null;
  }

  /**
   * NEW APPROACH: Initialize PDF document
   */
  initialize() {
    // Create PDF document (A4 size)
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    return this.pdf;
  }

  /**
   * NEW APPROACH: Render React component in iframe and capture
   */
  async renderComponent(component, pageIndex, totalPages) {
    return new Promise(async (resolve, reject) => {
      let iframe = null;

      try {
        console.log(`[PDF RENDERER] Rendering page ${pageIndex + 1} in iframe`);

        // Create hidden iframe
        iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '0';
        iframe.style.width = '960px';
        iframe.style.height = '1280px';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
        
        document.body.appendChild(iframe);

        // Wait for iframe to load
        await new Promise((resolve) => {
          iframe.onload = resolve;
          // Some browsers need a small delay
          setTimeout(resolve, 100);
        });

        // Get iframe document
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        
        // Render React component to HTML string
        const tempContainer = document.createElement('div');
        tempContainer.style.width = '960px';
        tempContainer.style.minHeight = '1280px';
        tempContainer.style.background = '#fff';
        tempContainer.style.fontFamily = "'DM Sans', sans-serif";
        tempContainer.style.position = 'relative';
        tempContainer.className = 'font-loaded';
        
        const root = createRoot(tempContainer);
        root.render(component);

        // Wait for React to render
        await new Promise(resolve => setTimeout(resolve, 200));

        // Get the rendered HTML
        const pageContent = tempContainer.innerHTML;
        
        // Clean up React root
        root.unmount();

        // Write full HTML to iframe with inline component registration
        const pageWithRegistration = addInlineComponentRegistration(pageContent, pageIndex);
        iframeDoc.open();
        iframeDoc.write(PDF_HTML_TEMPLATE(pageWithRegistration, pageIndex));
        iframeDoc.close();

        // Give PDF ready system time to initialize
        await new Promise(resolve => setTimeout(resolve, 50));

        // CRITICAL: Wait for page to be ready (data loaded) BEFORE font loading
        console.log('[PDF RENDERER] Waiting for page readiness BEFORE font loading...');
        
        // Debug: Check window contexts
        console.log('[PDF RENDERER] 📍 iframe has __PDF_ALL_READY__:', !!iframe.contentWindow?.__PDF_ALL_READY__);
        console.log('[PDF RENDERER] 📍 parent has __PDF_ALL_READY__:', !!window.__PDF_ALL_READY__);
        
        await new Promise((resolve, reject) => {
          const maxTime = 30000;
          const start = Date.now();

          const checkReady = () => {
            // Check parent window for ready state (NEW: system is in parent)
            const isReady = window.__PDF_ALL_READY__;

            if (isReady === true) {
              console.log('[PDF RENDERER] ✅ Page ready detected - now loading fonts');
              resolve();
            } else if (Date.now() - start > maxTime) {
              const status = window.__PDF_GET_STATUS__?.();
              const statusStr = status ? ` (${status.readyCount}/${status.totalCount} components ready)` : '';
              reject(new Error(`PDF render timeout: data not ready after ${maxTime}ms${statusStr}`));
            } else {
              // Log status every 2 seconds
              const waited = Date.now() - start;
              if (waited % 2000 === 0) {
                const status = window.__PDF_GET_STATUS__?.();
                if (status) {
                  console.log(`[PDF RENDERER] ⏳ Waiting... ${status.readyCount}/${status.totalCount} components ready (${waited}ms)`);
                } else {
                  console.log(`[PDF RENDERER] ⏳ Waiting for page readiness... (${waited}ms)`);
                }
              }
              setTimeout(checkReady, 100);
            }
          };

          checkReady();
        });

        // Now wait for fonts to load AFTER data is ready
        console.log('[PDF RENDERER] Page ready - now waiting for fonts to load in iframe');
        await Promise.all([
          iframe.contentWindow.document.fonts.load('1em Syne'),
          iframe.contentWindow.document.fonts.load('1em DM Sans'),
          iframe.contentWindow.document.fonts.ready
        ]);

        console.log('[PDF RENDERER] ✅ Fonts loaded - proceeding with capture');

        // Capture iframe body
        const canvas = await html2canvas(iframeDoc.body, {
          width: 960,
          height: 1280,
          scale: 2, // Retina quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          removeContainer: false,
          foreignObjectRendering: false,
          imageTimeout: 15000,
          // No onclone needed - iframe already has proper fonts and CSS
          onclone: null
        });

        resolve(canvas);

      } catch (error) {
        console.error('[PDF RENDERER] Error rendering page:', error);
        reject(error);
      } finally {
        // Clean up iframe
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }
    });
  }

  /**
   * Add canvas to PDF
   */
  addCanvasToPDF(canvas, isFirstPage = false) {
    if (!this.pdf) {
      throw new Error('PDF not initialized');
    }

    // Add new page if not first
    if (!isFirstPage) {
      this.pdf.addPage();
    }

    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const pageHeight = this.pdf.internal.pageSize.getHeight();

    // Calculate dimensions to fit A4 page
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add image to PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    this.pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  }

  /**
   * Save PDF with filename
   */
  save(filename) {
    if (!this.pdf) {
      throw new Error('PDF not initialized');
    }
    this.pdf.save(filename);
  }

  /**
   * Get PDF as blob (for API responses)
   */
  getBlob() {
    if (!this.pdf) {
      throw new Error('PDF not initialized');
    }
    
    // Convert jsPDF to blob
    const pdfOutput = this.pdf.output('blob');
    return pdfOutput;
  }

  /**
   * NEW APPROACH: Clean up resources
   */
  cleanup() {
    // No persistent container to clean up with iframe approach
    this.pdf = null;
  }
}

export default PDFRenderer;
