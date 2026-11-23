import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTimeZone } from './useTimeZone';
import { useViewerZoneFormat } from './useViewerZoneFormat';

vi.mock('./useTimeZone', () => ({ useTimeZone: vi.fn() }));

// 12:00 UTC on Jan 15 is already Jan 16 in Auckland (UTC+13).
const invitedAt = '2024-01-15T12:00:00.000Z';

describe('useViewerZoneFormat', () => {
	describe('when the zone is known', () => {
		beforeEach(() => {
			vi.mocked(useTimeZone).mockReturnValue('Pacific/Auckland');
		});

		it('knows the zone', () => {
			const { result } = renderHook(() => useViewerZoneFormat());

			expect(result.current.isKnown).toBe(true);
		});

		it("formats a moment in the viewer's zone", () => {
			const { result } = renderHook(() => useViewerZoneFormat());

			expect(result.current.format(invitedAt, 'shortMonthDayYear')).toBe(
				'Jan 16, 2024',
			);
		});
	});

	describe('when the zone is unknown', () => {
		beforeEach(() => {
			vi.mocked(useTimeZone).mockReturnValue(null);
		});

		it("doesn't know the zone", () => {
			const { result } = renderHook(() => useViewerZoneFormat());

			expect(result.current.isKnown).toBe(false);
		});

		it('formats a moment in UTC', () => {
			const { result } = renderHook(() => useViewerZoneFormat());

			expect(result.current.format(invitedAt, 'shortMonthDayYear')).toBe(
				'Jan 15, 2024',
			);
		});
	});
});
