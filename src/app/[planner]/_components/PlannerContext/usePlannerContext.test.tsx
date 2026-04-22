import { renderHook, waitFor } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { PlannerProvider } from './PlannerProvider';
import { usePlannerContext } from './usePlannerContext';

const mockGetPlannerClient = vi.fn();
vi.mock('@/_actions', () => ({
	getPlannerClient: (...args: unknown[]) => mockGetPlannerClient(...args),
}));

const maleficentsPlanner = { calendar: [], saved: [], tags: [] };
const id = '507f1f77bcf86cd799439011';

describe('usePlannerContext', () => {
	test('returns planner data from context', async () => {
		mockGetPlannerClient.mockResolvedValue(maleficentsPlanner);

		const { result } = renderHook(() => usePlannerContext(), {
			wrapper: ({ children }) => (
				<PlannerProvider id={id} accessLevel="owner">
					{children}
				</PlannerProvider>
			),
		});

		await waitFor(() => {
			expect(result.current).toEqual({
				...maleficentsPlanner,
				accessLevel: 'owner',
			});
		});
	});
});
