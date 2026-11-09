/**
 * Shared mock for posthog-js.
 *
 * Usage in a test file:
 *
 *   import posthog from 'posthog-js';
 *   vi.mock('posthog-js', async () => await import('#mocks/posthog-js'));
 *
 * Then assert on `posthog.init` or `posthog.captureException`.
 */

import { vi } from 'vitest';

const posthog = {
	init: vi.fn(),
	captureException: vi.fn(),
};

export default posthog;
