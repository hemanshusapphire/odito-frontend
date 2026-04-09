/**
 * PDF Readiness Manager
 * 
 * Centralized system to coordinate PDF component loading states
 * and signal when all components are ready for PDF generation.
 * 
 * Usage:
 * 1. Component calls registerComponent() on mount
 * 2. Component calls setComponentReady(componentId, true) when data is loaded
 * 3. Manager automatically sets global __PDF_READY__ flag when all registered components are ready
 */

class PDFReadinessManager {
  constructor() {
    this.components = new Map();
    this.debugMode = true;
    
    // Initialize global flag
    if (typeof window !== 'undefined') {
      window.__PDF_READY__ = false;
    }
  }

  /**
   * Register a component that will participate in PDF readiness
   * @param {string} componentId - Unique component identifier
   * @param {string} componentName - Human readable component name
   */
  registerComponent(componentId, componentName) {
    this.components.set(componentId, {
      name: componentName,
      isReady: false,
      registeredAt: Date.now()
    });
    
    this.log(`REGISTERED: ${componentName} (${componentId})`);
    this.updateGlobalReadiness();
  }

  /**
   * Unregister a component (cleanup on unmount)
   * @param {string} componentId - Component identifier
   */
  unregisterComponent(componentId) {
    if (this.components.has(componentId)) {
      const component = this.components.get(componentId);
      this.components.delete(componentId);
      this.log(`UNREGISTERED: ${component.name} (${componentId})`);
      this.updateGlobalReadiness();
    }
  }

  /**
   * Mark a component as ready (data loaded)
   * @param {string} componentId - Component identifier
   * @param {boolean} isReady - Ready state
   */
  setComponentReady(componentId, isReady = true) {
    if (this.components.has(componentId)) {
      const component = this.components.get(componentId);
      component.isReady = isReady;
      component.readyAt = isReady ? Date.now() : null;
      
      this.log(`${isReady ? 'READY' : 'NOT READY'}: ${component.name} (${componentId})`);
      this.updateGlobalReadiness();
    } else {
      this.log(`WARNING: Component ${componentId} not registered`);
    }
  }

  /**
   * Update global readiness flag based on all component states
   */
  updateGlobalReadiness() {
    if (typeof window === 'undefined') return;

    const allComponents = Array.from(this.components.values());
    const readyComponents = allComponents.filter(c => c.isReady);
    const totalComponents = allComponents.length;
    
    if (totalComponents === 0) {
      // No components registered yet, not ready
      window.__PDF_READY__ = false;
      this.log('READINESS: No components registered - NOT READY');
      return;
    }

    const allReady = readyComponents.length === totalComponents;
    window.__PDF_READY__ = allReady;
    
    this.log(`READINESS: ${readyComponents.length}/${totalComponents} components ready - ${allReady ? 'READY' : 'NOT READY'}`);
    
    if (allReady) {
      this.log('🎉 ALL COMPONENTS READY - PDF can be generated');
      
      // Log timing information
      const now = Date.now();
      allComponents.forEach(comp => {
        if (comp.readyAt) {
          const loadTime = comp.readyAt - comp.registeredAt;
          this.log(`⏱️  ${comp.name}: ${loadTime}ms`);
        }
      });
    }
  }

  /**
   * Get current readiness status
   */
  getStatus() {
    const allComponents = Array.from(this.components.values());
    const readyComponents = allComponents.filter(c => c.isReady);
    
    return {
      total: allComponents.length,
      ready: readyComponents.length,
      allReady: readyComponents.length === allComponents.length,
      components: allComponents.map(c => ({
        id: Array.from(this.components.entries()).find(([_, v]) => v === c)[0],
        name: c.name,
        isReady: c.isReady
      }))
    };
  }

  /**
   * Reset all readiness states (for new PDF generation)
   */
  reset() {
    this.components.clear();
    if (typeof window !== 'undefined') {
      window.__PDF_READY__ = false;
    }
    this.log('RESET: All component states cleared');
  }

  /**
   * Debug logging
   */
  log(message) {
    if (this.debugMode && typeof console !== 'undefined') {
      console.log(`[PDF_READINESS_MANAGER] ${message}`);
    }
  }
}

// Create singleton instance
const pdfReadinessManager = new PDFReadinessManager();

export default pdfReadinessManager;

// React hook for easy usage
export function usePDFReadiness(componentId, componentName) {
  const { useEffect } = require('react');
  
  useEffect(() => {
    // Register component
    pdfReadinessManager.registerComponent(componentId, componentName);
    
    // Cleanup on unmount
    return () => {
      pdfReadinessManager.unregisterComponent(componentId);
    };
  }, [componentId, componentName]);
  
  return {
    setReady: (isReady = true) => pdfReadinessManager.setComponentReady(componentId, isReady),
    getStatus: () => pdfReadinessManager.getStatus()
  };
}
