import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTimeZone } from './useTimeZone';
import { useToday } from './useToday';

vi.mock('./useTimeZone', () => ({ useTimeZone: vi.fn() }));

describe('useToday', () => {
	beforeEach(() => {
		vi.mocked(useTimeZone).mockReturnValue('Pacific/Kiritimati');
		vi.useFakeTimers();
		// 2025-09-15 20:00 UTC is already 2025-09-16 in Kiritimati (UTC+14).
		vi.setSystemTime(new Date('2025-09-15T20:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns the start of today in the viewer's zone", () => {
		const { result } = renderHook(() => useToday());

		expect(result.current.toISO()).toBe('2025-09-16T00:00:00.000+14:00');
	});

	it('returns the same object for the same day', () => {
		const { result, rerender } = renderHook(() => useToday());
		const first = result.current;

		vi.setSystemTime(new Date('2025-09-15T21:00:00Z'));
		rerender();

		expect(result.current).toBe(first);
	});

	it('throws when there is no zone', () => {
		vi.mocked(useTimeZone).mockReturnValue(null);

		expect(() => renderHook(() => useToday())).toThrow(
			'Coding error: useToday() was called before the time zone is known.',
		);
	});
});
