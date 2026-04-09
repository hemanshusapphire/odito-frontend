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
  
  <!-- Global PDF Ready System -->
  <script>
    (function() {
      'use strict';
      
      const PDF_READY_STATE = {
        components: new Map(),
        isReady: false,
        debugMode: true,
        startTime: Date.now()
      };
      
      window.__PDF_READY_STATE__ = PDF_READY_STATE;
      
      window.__PDF_SET_READY__ = function(componentId, ready, componentName = componentId) {
        const timestamp = Date.now() - PDF_READY_STATE.startTime;
        
        if (ready) {
          PDF_READY_STATE.components.set(componentId, {
            name: componentName,
            ready: true,
            timestamp: timestamp
          });
          
          console.log('[PDF READY] ✅ ' + componentName + ' ready (' + timestamp + 'ms)');
        } else {
          PDF_READY_STATE.components.delete(componentId);
          console.log('[PDF READY] ❌ ' + componentName + ' removed');
        }
        
        checkAllReady();
      };
      
      window.__PDF_REGISTER_COMPONENT__ = function(componentId, componentName = componentId) {
        PDF_READY_STATE.components.set(componentId, {
          name: componentName,
          ready: false,
          timestamp: 0
        });
        
        console.log('[PDF READY] 📝 ' + componentName + ' registered');
      };
      
      window.__PDF_GET_STATUS__ = function() {
        const components = Array.from(PDF_READY_STATE.components.entries()).map(function(entry) {
          return { id: entry[0], name: entry[1].name, ready: entry[1].ready, timestamp: entry[1].timestamp };
        });
        
        const readyCount = components.filter(function(c) { return c.ready; }).length;
        const totalCount = components.length;
        
        return {
          allReady: PDF_READY_STATE.isReady,
          readyCount: readyCount,
          totalCount: totalCount,
          components: components,
          timestamp: Date.now() - PDF_READY_STATE.startTime
        };
      };
      
      window.__PDF_RESET_READY__ = function() {
        PDF_READY_STATE.components.clear();
        PDF_READY_STATE.isReady = false;
        PDF_READY_STATE.startTime = Date.now();
        console.log('[PDF READY] 🔄 Reset - Ready for new PDF generation');
      };
      
      function checkAllReady() {
        const components = Array.from(PDF_READY_STATE.components.values());
        
        if (components.length === 0) {
          PDF_READY_STATE.isReady = true;
          window.__PDF_ALL_READY__ = true;
          console.log('[PDF READY] 🎉 No components to wait for - READY');
          return;
        }
        
        const allReady = components.every(function(comp) { return comp.ready === true; });
        
        if (allReady && !PDF_READY_STATE.isReady) {
          PDF_READY_STATE.isReady = true;
          window.__PDF_ALL_READY__ = true;
          
          const timestamp = Date.now() - PDF_READY_STATE.startTime;
          console.log('[PDF READY] 🎉 ALL COMPONENTS READY - PDF can be generated (' + timestamp + 'ms)');
          
          components.forEach(function(comp) {
            console.log('[PDF READY] ⏱️  ' + comp.name + ': ' + comp.timestamp + 'ms');
          });
        } else if (!allReady && PDF_READY_STATE.isReady) {
          PDF_READY_STATE.isReady = false;
          window.__PDF_ALL_READY__ = false;
          console.log('[PDF READY] ⚠️ Ready state changed to false');
        }
        
        window.__PDF_ALL_READY__ = PDF_READY_STATE.isReady;
      }
      
      window.__PDF_ALL_READY__ = false;
      console.log('[PDF READY] 🚀 Global PDF Ready System initialized');
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

        // Reset ready state for new page
        if (iframe.contentWindow && iframe.contentWindow.__PDF_RESET_READY__) {
          iframe.contentWindow.__PDF_RESET_READY__();
        }

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

        // Write full HTML to iframe
        iframeDoc.open();
        iframeDoc.write(PDF_HTML_TEMPLATE(pageContent, pageIndex));
        iframeDoc.close();

        // Reset ready state for new page
        if (iframe.contentWindow && iframe.contentWindow.__PDF_RESET_READY__) {
          iframe.contentWindow.__PDF_RESET_READY__();
        }

        // CRITICAL: Wait for page to be ready (data loaded) BEFORE font loading
        console.log('[PDF RENDERER] Waiting for page readiness BEFORE font loading...');
        
        await new Promise((resolve) => {
          const maxTime = 15000; // 15 second timeout
          const interval = 100; // Check every 100ms
          let waited = 0;

          const checkReady = () => {
            const ready = iframe.contentWindow?.__PDF_ALL_READY__;
            
            if (ready === true) {
              console.log('[PDF RENDERER] ✅ Page ready detected - now loading fonts');
              resolve();
            } else {
              waited += interval;

              if (waited >= maxTime) {
                console.warn('[PDF RENDERER] ⚠️ Ready timeout - proceeding with font loading (fallback)');
                resolve();
              } else {
                // Log status every 2 seconds
                if (waited % 2000 === 0) {
                  const status = iframe.contentWindow?.__PDF_GET_STATUS__?.();
                  if (status) {
                    console.log(`[PDF RENDERER] ⏳ Waiting... ${status.readyCount}/${status.totalCount} components ready (${waited}ms)`);
                  } else {
                    console.log(`[PDF RENDERER] ⏳ Waiting for page readiness... (${waited}ms)`);
                  }
                }
                setTimeout(checkReady, interval);
              }
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
