import type { ReactNode } from 'react';

import { renderHook } from '@testing-library/react';

import { describe, expect, test } from 'vitest';

import { ToggleContext } from './ToggleContext';
import { useToggleContext } from './useToggleContext';

describe('useToggleContext', () => {
	test('throws error when used outside ToggleProvider', () => {
		expect(() => renderHook(() => useToggleContext())).toThrow(
			'useToggleContext must be used within ToggleProvider',
		);
	});

	test('returns the context value inside a provider', () => {
		const value = { opened: true, toggle: () => {} };
		const wrapper = ({ children }: { children: ReactNode }) => (
			<ToggleContext.Provider value={value}>{children}</ToggleContext.Provider>
		);

		const { result } = renderHook(() => useToggleContext(), { wrapper });

		expect(result.current).toBe(value);
	});
});
