import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

/**
 * Unit / integration test runner.
 *
 * Run: `npm run test` (watch) or `npm run test:run` (CI).
 * Tests live next to source as `*.test.js(x)` or under `__tests__/`.
 * Requires devDependencies: vitest, @vitejs/plugin-react, jsdom.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})
