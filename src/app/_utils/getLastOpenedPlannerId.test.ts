import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cookies } from 'next/headers';

import type { PlannerMembership } from '@/_models/user';

import { getLastOpenedPlannerId } from './getLastOpenedPlannerId';

vi.mock('next/headers', async () => await import('#mocks/next/headers'));

const firstPlannerId = '507f1f77bcf86cd799439011';
const otherPlannerId = '507f1f77bcf86cd799439022';

const planners: PlannerMembership[] = [
	{ _id: '1', planner: firstPlannerId, accessLevel: 'owner' },
	{ _id: '2', planner: otherPlannerId, accessLevel: 'write' },
];

const mockCookie = (value: string) => {
	vi.mocked(cookies).mockResolvedValueOnce({
		get: vi.fn().mockReturnValue({ value }),
	} as never);
};

describe('getLastOpenedPlannerId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns the first planner when there is no last-opened cookie', async () => {
		expect(await getLastOpenedPlannerId(planners)).toBe(firstPlannerId);
	});

	it('returns the last-opened planner when the cookie matches a planner', async () => {
		mockCookie(otherPlannerId);

		expect(await getLastOpenedPlannerId(planners)).toBe(otherPlannerId);
	});

	it('returns the first planner when the cookie planner is not one of the user planners', async () => {
		mockCookie('507f1f77bcf86cd799439099');

		expect(await getLastOpenedPlannerId(planners)).toBe(firstPlannerId);
	});
});
