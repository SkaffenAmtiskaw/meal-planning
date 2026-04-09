import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    alias: {
        'server-only': new URL('./test/mocks/server-only.ts', import.meta.url).pathname,
        '@mocks': new URL('./test/mocks', import.meta.url).pathname,
    },
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      // Excluded files should are either test files or files that should NEVER have logic - any logic should be
      // pulled into separate testable modules.
      exclude: [
          // Mantine theme config
          'src/_theme/*',
          // better-auth config
          'src/_auth/auth.ts',
          // env variable definitions
          'src/env.ts',
          // next.js instrumentation script
          'src/instrumentation.ts',
          // better-auth route handler
          'src/app/api/auth/\\[...all\\]/route.ts',
          // constants files - should NEVER contain code
          'src/**/_constants.ts',
          // barrel/index files - re-export only, should NEVER contain logic
          'src/**/index.{ts,tsx}',
          // type declaration files - no runtime code
          'src/**/*.d.ts',
          // test files
          'src/**/*.test.{ts,tsx}',
          // test mocks
          'test/mocks/**'
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
})
