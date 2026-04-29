import { act, renderHook } from '@testing-library/react';

import { describe, expect, test } from 'vitest';

import { useViewType } from './useViewType';

describe('useViewType', () => {
	test('defaults to month', () => {
		const { result } = renderHook(() => useViewType(false));
		expect(result.current.viewType).toBe('month');
	});

	test('setViewType updates the view type', () => {
		const { result } = renderHook(() => useViewType(false));
		act(() => result.current.setViewType('list'));
		expect(result.current.viewType).toBe('list');
	});

	test('falls back to list when mobile and week is active', () => {
		const { result, rerender } = renderHook(
			({ isMobile }: { isMobile: boolean }) => useViewType(isMobile),
			{ initialProps: { isMobile: false } },
		);
		act(() => result.current.setViewType('week'));
		rerender({ isMobile: true });
		expect(result.current.viewType).toBe('list');
	});

	test('does not fall back when mobile and view is not week', () => {
		const { result, rerender } = renderHook(
			({ isMobile }: { isMobile: boolean }) => useViewType(isMobile),
			{ initialProps: { isMobile: false } },
		);
		act(() => result.current.setViewType('month'));
		rerender({ isMobile: true });
		expect(result.current.viewType).toBe('month');
	});
});
