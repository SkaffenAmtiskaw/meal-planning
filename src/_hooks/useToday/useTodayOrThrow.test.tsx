import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { makeKnownDay, makeUnknownDay } from '#fixtures/viewerDay';

import { useToday } from './useToday';
import { useTodayOrThrow } from './useTodayOrThrow';

vi.mock('./useToday', () => ({ useToday: vi.fn() }));

describe('useTodayOrThrow', () => {
	it('returns today when the day is known', () => {
		const today = DateTime.fromISO('2025-09-16');
		vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

		const { result } = renderHook(() => useTodayOrThrow());

		expect(result.current).toBe(today);
	});

	it('throws while the day is unknown', () => {
		vi.mocked(useToday).mockReturnValue(
			makeUnknownDay(DateTime.fromISO('2025-09-15')),
		);

		expect(() => renderHook(() => useTodayOrThrow())).toThrow(
			'Coding error: useTodayOrThrow() was called before the time zone is known.',
		);
	});
});
