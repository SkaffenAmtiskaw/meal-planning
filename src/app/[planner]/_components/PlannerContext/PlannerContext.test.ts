import { createElement, type ReactNode, useContext } from 'react';

import { renderHook } from '@testing-library/react';

import { describe, expect, test } from 'vitest';

import { PlannerContext } from './PlannerContext';

describe('planner context', () => {
	test('is a valid React context with default value null', () => {
		expect(PlannerContext).toHaveProperty('Provider');
		expect(PlannerContext).toHaveProperty('Consumer');

		const { result } = renderHook(() => useContext(PlannerContext));
		expect(result.current).toBeNull();
	});

	test('context value includes accessLevel property', () => {
		const mockValue = {
			name: 'Test Planner',
			calendar: [],
			saved: [],
			tags: [],
			accessLevel: 'owner' as const,
		};

		const wrapper = ({ children }: { children: ReactNode }) =>
			createElement(PlannerContext.Provider, { value: mockValue }, children);

		const { result } = renderHook(() => useContext(PlannerContext), {
			wrapper,
		});

		expect(result.current).toHaveProperty('accessLevel');
		expect((result.current as typeof mockValue).accessLevel).toBe('owner');
	});
});
