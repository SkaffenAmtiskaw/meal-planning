import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

import { SnackbarContext, useSnackbar } from './SnackbarContext';

describe('useSnackbar', () => {
	it('returns the context value inside a SnackbarProvider', () => {
		const value = { show: vi.fn() };
		const wrapper = ({ children }: { children: ReactNode }) => (
			<SnackbarContext.Provider value={value}>
				{children}
			</SnackbarContext.Provider>
		);

		const { result } = renderHook(() => useSnackbar(), { wrapper });

		expect(result.current).toBe(value);
	});

	it('throws outside a SnackbarProvider', () => {
		expect(() => renderHook(() => useSnackbar())).toThrow(
			'useSnackbar must be used within a SnackbarProvider',
		);
	});
});
