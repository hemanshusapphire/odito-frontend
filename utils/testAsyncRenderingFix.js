/**
 * Comprehensive Test for Async Rendering Bug Fix
 * 
 * This test validates that the PDF renderer now properly waits for
 * React component data to load before capturing screenshots.
 * 
 * Tests the complete fix:
 * 1. Global ready signal system
 * 2. Component registration and ready signaling
 * 3. Renderer waiting mechanism
 * 4. Slow API handling
 * 5. Error recovery
 */

class AsyncRenderingFixTest {
  constructor() {
    this.testResults = [];
    this.debugMode = true;
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🧪';
    console.log(`[ASYNC_RENDERING_TEST] ${prefix} ${message}`);
  }

  /**
   * Test 1: Global Ready Signal System
   */
  async testGlobalReadySystem() {
    this.log('Testing global ready signal system');
    
    try {
      // Reset system
      if (typeof window !== 'undefined' && window.__PDF_RESET_READY__) {
        window.__PDF_RESET_READY__();
      }

      // Simulate component registration
      if (typeof window !== 'undefined' && window.__PDF_REGISTER_COMPONENT__) {
        window.__PDF_REGISTER_COMPONENT__('test-comp-1', 'Test Component 1');
        window.__PDF_REGISTER_COMPONENT__('test-comp-2', 'Test Component 2');
      }

      // Check initial state
      let status = typeof window !== 'undefined' ? window.__PDF_GET_STATUS__?.() : null;
      if (!status || status.readyCount !== 0 || status.totalCount !== 2) {
        throw new Error('Initial state incorrect');
      }

      // Mark components as ready
      if (typeof window !== 'undefined' && window.__PDF_SET_READY__) {
        window.__PDF_SET_READY__('test-comp-1', true, 'Test Component 1');
        
        status = window.__PDF_GET_STATUS__();
        if (status.readyCount !== 1 || status.allReady !== false) {
          throw new Error('Partial ready state incorrect');
        }

        window.__PDF_SET_READY__('test-comp-2', true, 'Test Component 2');
      }

      // Check final state
      status = typeof window !== 'undefined' ? window.__PDF_GET_STATUS__?.() : null;
      if (!status || status.readyCount !== 2 || status.allReady !== true) {
        throw new Error('Final ready state incorrect');
      }

      this.log('Global ready system test PASSED', 'success');
      this.testResults.push({ test: 'global-ready-system', passed: true });
      return true;

    } catch (error) {
      this.log(`Global ready system test FAILED: ${error.message}`, 'error');
      this.testResults.push({ test: 'global-ready-system', passed: false, error: error.message });
      return false;
    }
  }

  /**
   * Test 2: Slow API Simulation
   */
  async testSlowAPISimulation() {
    this.log('Testing slow API simulation');
    
    try {
      // Reset system
      if (typeof window !== 'undefined' && window.__PDF_RESET_READY__) {
        window.__PDF_RESET_READY__();
      }

      const startTime = Date.now();

      // Register components with different load times
      if (typeof window !== 'undefined' && window.__PDF_REGISTER_COMPONENT__) {
        window.__PDF_REGISTER_COMPONENT__('slow-comp-1', 'Slow Component 1');
        window.__PDF_REGISTER_COMPONENT__('slow-comp-2', 'Slow Component 2');
        window.__PDF_REGISTER_COMPONENT__('slow-comp-3', 'Slow Component 3');
      }

      // Simulate slow data loading
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.__PDF_SET_READY__) {
          window.__PDF_SET_READY__('slow-comp-1', true, 'Slow Component 1');
        }
      }, 1000);

      setTimeout(() => {
        if (typeof window !== 'undefined' && window.__PDF_SET_READY__) {
          window.__PDF_SET_READY__('slow-comp-2', true, 'Slow Component 2');
        }
      }, 2000);

      setTimeout(() => {
        if (typeof window !== 'undefined' && window.__PDF_SET_READY__) {
          window.__PDF_SET_READY__('slow-comp-3', true, 'Slow Component 3');
        }
      }, 3000);

      // Wait for all components to be ready
      await new Promise(resolve => {
        const checkReady = () => {
          const status = typeof window !== 'undefined' ? window.__PDF_GET_STATUS__?.() : null;
          if (status && status.allReady) {
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });

      const totalTime = Date.now() - startTime;
      
      // Should take approximately 3 seconds
      if (totalTime < 2900 || totalTime > 3200) {
        throw new Error(`Unexpected timing: ${totalTime}ms (expected ~3000ms)`);
      }

      this.log(`Slow API simulation test PASSED (${totalTime}ms)`, 'success');
      this.testResults.push({ test: 'slow-api-simulation', passed: true, time: totalTime });
      return true;

    } catch (error) {
      this.log(`Slow API simulation test FAILED: ${error.message}`, 'error');
      this.testResults.push({ test: 'slow-api-simulation', passed: false, error: error.message });
      return false;
    }
  }

  /**
   * Test 3: Renderer Waiting Logic
   */
  async testRendererWaitingLogic() {
    this.log('Testing renderer waiting logic');
    
    try {
      // Simulate the renderer's waiting logic
      const startTime = Date.now();
      
      // Reset and register component
      if (typeof window !== 'undefined' && window.__PDF_RESET_READY__) {
        window.__PDF_RESET_READY__();
        window.__PDF_REGISTER_COMPONENT__('renderer-test', 'Renderer Test Component');
      }

      // Simulate renderer waiting
      await new Promise((resolve) => {
        const maxTime = 5000; // 5 second timeout for test
        const interval = 100; // Check every 100ms
        let waited = 0;

        const checkReady = () => {
          const ready = typeof window !== 'undefined' ? window.__PDF_ALL_READY__ : false;
          
          if (ready === true) {
            this.log('Renderer waiting logic: Ready detected');
            resolve();
          } else {
            waited += interval;

            if (waited >= maxTime) {
              this.log('Renderer waiting logic: Timeout reached');
              resolve();
            } else {
              setTimeout(checkReady, interval);
            }
          }
        };

        checkReady();
      });

      // Component should not be ready yet (no data loaded)
      let status = typeof window !== 'undefined' ? window.__PDF_GET_STATUS__?.() : null;
      if (status && status.allReady) {
        throw new Error('Component should not be ready without data');
      }

      // Now simulate data loading
      if (typeof window !== 'undefined' && window.__PDF_SET_READY__) {
        window.__PDF_SET_READY__('renderer-test', true, 'Renderer Test Component');
      }

      // Wait again
      await new Promise((resolve) => {
        const checkReady = () => {
          const ready = typeof window !== 'undefined' ? window.__PDF_ALL_READY__ : false;
          if (ready === true) {
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });

      const totalTime = Date.now() - startTime;
      
      // Should have waited for the component to be ready
      status = typeof window !== 'undefined' ? window.__PDF_GET_STATUS__?.() : null;
      if (!status || !status.allReady) {
        throw new Error('Component should be ready after data load');
      }

      this.log(`Renderer waiting logic test PASSED (${totalTime}ms)`, 'success');
      this.testResults.push({ test: 'renderer-waiting-logic', passed: true, time: totalTime });
      return true;

    } catch (error) {
      this.log(`Renderer waiting logic test FAILED: ${error.message}`, 'error');
      this.testResults.push({ test: 'renderer-waiting-logic', passed: false, error: error.message });
      return false;
    }
  }

  /**
   * Test 4: Error Handling and Recovery
   */
  async testErrorHandling() {
    this.log('Testing error handling and recovery');
    
    try {
      // Reset system
      if (typeof window !== 'undefined' && window.__PDF_RESET_READY__) {
        window.__PDF_RESET_READY__();
      }

      // Register components
      if (typeof window !== 'undefined' && window.__PDF_REGISTER_COMPONENT__) {
        window.__PDF_REGISTER_COMPONENT__('success-comp', 'Success Component');
        window.__PDF_REGISTER_COMPONENT__('fail-comp', 'Fail Component');
      }

      // Mark success component as ready
      if (typeof window !== 'undefined' && window.__PDF_SET_READY__) {
        window.__PDF_SET_READY__('success-comp', true, 'Success Component');
      }

      // Simulate component failure (unregister)
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.__PDF_SET_READY__) {
          window.__PDF_SET_READY__('fail-comp', false, 'Fail Component');
        }
      }, 200);

      // Wait for system to stabilize
      await new Promise(resolve => setTimeout(resolve, 400));

      // Check if system adapted
      const status = typeof window !== 'undefined' ? window.__PDF_GET_STATUS__?.() : null;
      if (!status || !status.allReady || status.totalCount !== 1) {
        throw new Error('Error recovery failed');
      }

      this.log('Error handling test PASSED', 'success');
      this.testResults.push({ test: 'error-handling', passed: true });
      return true;

    } catch (error) {
      this.log(`Error handling test FAILED: ${error.message}`, 'error');
      this.testResults.push({ test: 'error-handling', passed: false, error: error.message });
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.log('🚀 Starting Comprehensive Async Rendering Fix Test');
    this.log('='.repeat(60));
    
    this.testResults = [];
    
    const tests = [
      () => this.testGlobalReadySystem(),
      () => this.testSlowAPISimulation(),
      () => this.testRendererWaitingLogic(),
      () => this.testErrorHandling()
    ];
    
    for (const test of tests) {
      try {
        await test();
        this.log('-'.repeat(40));
      } catch (error) {
        this.log(`Test execution error: ${error.message}`, 'error');
      }
    }
    
    // Summary
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    this.log(`📊 ASYNC RENDERING FIX TEST SUMMARY: ${passed}/${total} tests passed`);
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const timeInfo = result.time ? ` (${result.time}ms)` : '';
      const errorInfo = result.error ? ` - ${result.error}` : '';
      this.log(`${status} ${result.test}${timeInfo}${errorInfo}`);
    });
    
    const success = passed === total;
    if (success) {
      this.log('🎉 ALL ASYNC RENDERING FIX TESTS PASSED!', 'success');
      this.log('✅ Global ready signal system working');
      this.log('✅ Slow API handling working');
      this.log('✅ Renderer waiting logic working');
      this.log('✅ Error handling working');
      this.log('✅ Race condition bug is FIXED');
    } else {
      this.log('⚠️ Some tests failed - review the implementation', 'warning');
    }
    
    return {
      passed,
      total,
      success,
      results: this.testResults
    };
  }
}

// Auto-run if executed directly
if (typeof window !== 'undefined') {
  window.testAsyncRenderingFix = async () => {
    const test = new AsyncRenderingFixTest();
    return await test.runAllTests();
  };
} else if (typeof global !== 'undefined') {
  global.testAsyncRenderingFix = async () => {
    const test = new AsyncRenderingFixTest();
    return await test.runAllTests();
  };
}

export default AsyncRenderingFixTest;
