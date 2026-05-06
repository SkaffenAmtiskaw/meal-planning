import type { ReactNode } from 'react';

import { renderHook } from '@testing-library/react';

import { describe, expect, it } from 'vitest';

import { PlannerContext } from './PlannerContext';
import { usePlannerContext } from './usePlannerContext';

const mockValue = {
	name: 'Test Planner',
	calendar: [],
	saved: [],
	tags: [],
	accessLevel: 'owner' as const,
};

const wrapper = ({ children }: { children: ReactNode }) => (
	<PlannerContext.Provider value={mockValue}>
		{children}
	</PlannerContext.Provider>
);

describe('usePlannerContext', () => {
	it('returns the current planner context value', () => {
		const { result } = renderHook(() => usePlannerContext(), { wrapper });

		expect(result.current).toEqual(mockValue);
	});
});
