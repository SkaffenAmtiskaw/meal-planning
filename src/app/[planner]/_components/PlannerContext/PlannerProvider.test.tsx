import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type ReactNode, useContext } from 'react';

import { PlannerContext } from './PlannerContext';
import { PlannerProvider } from './PlannerProvider';

const accessLevel = 'owner' as const;

const maleficentsPlanner = {
	_id: '507f1f77bcf86cd799439011',
	name: "Maleficent's Planner",
	calendar: [],
	saved: [],
	tags: [],
};

describe('PlannerProvider', () => {
	it('provides the planner with the access level to context', () => {
		const wrapper = ({ children }: { children: ReactNode }) => (
			<PlannerProvider planner={maleficentsPlanner} accessLevel={accessLevel}>
				{children}
			</PlannerProvider>
		);

		const { result } = renderHook(() => useContext(PlannerContext), {
			wrapper,
		});

		expect(result.current).toEqual({ ...maleficentsPlanner, accessLevel });
	});
});
