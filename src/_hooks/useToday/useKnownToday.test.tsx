import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeKnownDay, makeUnknownDay } from '#fixtures/viewerDay';

import { useKnownToday } from './useKnownToday';
import { useToday } from './useToday';

vi.mock('./useToday', () => ({ useToday: vi.fn() }));

describe('useKnownToday', () => {
	it('returns today when the day is known', () => {
		const today = DateTime.fromISO('2025-09-16');
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		const { result } = renderHook(() => useKnownToday());

		expect(result.current).toBe(today);
	});

	it('throws while the day is unknown', () => {
		vi.mocked(useToday).mockReturnValue(
			makeUnknownDay(DateTime.fromISO('2025-09-15')),
		);

		expect(() => renderHook(() => useKnownToday())).toThrow(
			'Coding error: useKnownToday() was called before the time zone is known.',
		);
	});
});
