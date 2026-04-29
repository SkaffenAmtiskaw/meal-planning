import { createElement, type ReactNode, useContext } from 'react';

import { renderHook } from '@testing-library/react';

import { describe, expect, test } from 'vitest';

import { ToggleContext } from './ToggleContext';

describe('toggle context', () => {
	test('is a valid React context with default value null', () => {
		expect(ToggleContext).toHaveProperty('Provider');
		expect(ToggleContext).toHaveProperty('Consumer');

		const { result } = renderHook(() => useContext(ToggleContext));
		expect(result.current).toBeNull();
	});

	test('context value includes opened and toggle properties', () => {
		const mockValue = {
			opened: true,
			toggle: () => {},
		};

		const wrapper = ({ children }: { children: ReactNode }) =>
			createElement(ToggleContext.Provider, { value: mockValue }, children);

		const { result } = renderHook(() => useContext(ToggleContext), {
			wrapper,
		});

		expect(result.current).toHaveProperty('opened');
		expect(result.current).toHaveProperty('toggle');
		expect((result.current as typeof mockValue).opened).toBe(true);
	});
});
