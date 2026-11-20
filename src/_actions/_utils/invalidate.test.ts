import { beforeEach, describe, expect, it, vi } from 'vitest';

import { plannerCache } from './caches';
import { invalidate } from './invalidate';

// Reached through vi.hoisted rather than imported, so this file needn't import next/cache.
const nextCache = vi.hoisted(() => ({ updateTag: vi.fn(), refresh: vi.fn() }));
vi.mock('next/cache', () => nextCache);

const plannerId = '507f1f77bcf86cd799439011';

describe('invalidate', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('updates each tag', () => {
		invalidate([
			plannerCache.calendar(plannerId),
			plannerCache.saved(plannerId),
		]);

		expect(nextCache.updateTag.mock.calls).toEqual([
			[plannerCache.calendar(plannerId)],
			[plannerCache.saved(plannerId)],
		]);
	});
});
