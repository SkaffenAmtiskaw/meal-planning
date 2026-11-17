import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useCanWrite } from './useCanWrite';
import { usePlannerContext } from './usePlannerContext';

vi.mock('./usePlannerContext', () => ({
	usePlannerContext: vi.fn(),
}));

describe('useCanWrite', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	test('returns false when accessLevel is read', () => {
		vi.mocked(usePlannerContext).mockReturnValue({
			accessLevel: 'read',
			_id: '507f1f77bcf86cd799439011',
			calendar: [],
			saved: [],
			tags: [],
		} as ReturnType<typeof usePlannerContext>);

		const { result } = renderHook(() => useCanWrite());

		expect(result.current).toBe(false);
	});

	test('returns true when accessLevel is write', () => {
		vi.mocked(usePlannerContext).mockReturnValue({
			accessLevel: 'write',
			_id: '507f1f77bcf86cd799439011',
			calendar: [],
			saved: [],
			tags: [],
		} as ReturnType<typeof usePlannerContext>);

		const { result } = renderHook(() => useCanWrite());

		expect(result.current).toBe(true);
	});

	test('returns true when accessLevel is admin', () => {
		vi.mocked(usePlannerContext).mockReturnValue({
			accessLevel: 'admin',
			_id: '507f1f77bcf86cd799439011',
			calendar: [],
			saved: [],
			tags: [],
		} as ReturnType<typeof usePlannerContext>);

		const { result } = renderHook(() => useCanWrite());

		expect(result.current).toBe(true);
	});

	test('returns true when accessLevel is owner', () => {
		vi.mocked(usePlannerContext).mockReturnValue({
			accessLevel: 'owner',
			_id: '507f1f77bcf86cd799439011',
			calendar: [],
			saved: [],
			tags: [],
		} as ReturnType<typeof usePlannerContext>);

		const { result } = renderHook(() => useCanWrite());

		expect(result.current).toBe(true);
	});
});
