/**
 * Shared mock for @/_models/types.
 *
 * Usage in a test file:
 *   vi.mock('@/_models/types', async () => await import('@mocks/@/_models/types'))
 *
 * This barrel re-exports type-safe stubs from all domain groups.
 */

export * from '@mocks/@/_models/calendar';
export * from '@mocks/@/_models/library';
export * from '@mocks/@/_models/planner';
export * from '@mocks/@/_models/sharing';
export * from '@mocks/@/_models/user';
