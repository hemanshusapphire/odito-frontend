/**
 * Global PDF Ready Signal System
 * 
 * Solves the race condition between React data fetching and PDF screenshot capture.
 * 
 * Usage:
 * 1. Each PDF component calls window.__PDF_SET_READY__(componentId, true) when data is loaded
 * 2. Renderer waits for window.__PDF_ALL_READY__ to be true
 * 3. System tracks all components and provides comprehensive logging
 */

(function() {
  'use strict';

  // Global state
  const PDF_READY_STATE = {
    components: new Map(),
    isReady: false,
    debugMode: true,
    startTime: Date.now()
  };

  // Initialize global window object
  if (typeof window !== 'undefined') {
    window.__PDF_READY_STATE__ = PDF_READY_STATE;
    
    /**
     * Set component ready status
     * @param {string} componentId - Unique component identifier
     * @param {boolean} ready - Ready status
     * @param {string} componentName - Human readable name (optional)
     */
    window.__PDF_SET_READY__ = function(componentId, ready, componentName = componentId) {
      const timestamp = Date.now() - PDF_READY_STATE.startTime;
      
      if (ready) {
        PDF_READY_STATE.components.set(componentId, {
          name: componentName,
          ready: true,
          timestamp: timestamp
        });
        
        console.log(`[PDF READY] ✅ ${componentName} ready (${timestamp}ms)`);
      } else {
        PDF_READY_STATE.components.delete(componentId);
        console.log(`[PDF READY] ❌ ${componentName} removed`);
      }
      
      // Check if all registered components are ready
      checkAllReady();
    };

    /**
     * Register component (marks as pending)
     * @param {string} componentId - Unique component identifier
     * @param {string} componentName - Human readable name (optional)
     */
    window.__PDF_REGISTER_COMPONENT__ = function(componentId, componentName = componentId) {
      PDF_READY_STATE.components.set(componentId, {
        name: componentName,
        ready: false,
        timestamp: 0
      });
      
      console.log(`[PDF READY] 📝 ${componentName} registered`);
    };

    /**
     * Get current ready status
     */
    window.__PDF_GET_STATUS__ = function() {
      const components = Array.from(PDF_READY_STATE.components.entries()).map(([id, info]) => ({
        id,
        ...info
      }));
      
      const readyCount = components.filter(c => c.ready).length;
      const totalCount = components.length;
      
      return {
        allReady: PDF_READY_STATE.isReady,
        readyCount,
        totalCount,
        components,
        timestamp: Date.now() - PDF_READY_STATE.startTime
      };
    };

    /**
     * Reset the ready state (for new PDF generation)
     */
    window.__PDF_RESET_READY__ = function() {
      PDF_READY_STATE.components.clear();
      PDF_READY_STATE.isReady = false;
      PDF_READY_STATE.startTime = Date.now();
      console.log('[PDF READY] 🔄 Reset - Ready for new PDF generation');
    };

    /**
     * Check if all components are ready
     */
    function checkAllReady() {
      const components = Array.from(PDF_READY_STATE.components.values());
      
      if (components.length === 0) {
        // No components registered - consider ready
        PDF_READY_STATE.isReady = true;
        window.__PDF_ALL_READY__ = true;
        console.log('[PDF READY] 🎉 No components to wait for - READY');
        return;
      }
      
      const allReady = components.every(comp => comp.ready === true);
      
      if (allReady && !PDF_READY_STATE.isReady) {
        PDF_READY_STATE.isReady = true;
        window.__PDF_ALL_READY__ = true;
        
        const timestamp = Date.now() - PDF_READY_STATE.startTime;
        console.log(`[PDF READY] 🎉 ALL COMPONENTS READY - PDF can be generated (${timestamp}ms)`);
        
        // Log component timing
        components.forEach(comp => {
          console.log(`[PDF READY] ⏱️  ${comp.name}: ${comp.timestamp}ms`);
        });
      } else if (!allReady && PDF_READY_STATE.isReady) {
        // Should not happen, but handle it
        PDF_READY_STATE.isReady = false;
        window.__PDF_ALL_READY__ = false;
        console.log('[PDF READY] ⚠️ Ready state changed to false');
      }
      
      // Update global flag
      window.__PDF_ALL_READY__ = PDF_READY_STATE.isReady;
    }

    // Initialize
    window.__PDF_ALL_READY__ = false;
    console.log('[PDF READY] 🚀 Global PDF Ready System initialized');
  }

})();
