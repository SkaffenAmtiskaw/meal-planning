import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getUser } from '@/_actions/user';
import { planners } from '@/_models/database/planners';

import { getPlanners } from './getPlanners';

vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);
vi.mock('@/_actions/user', async () => await import('#mocks/@/_actions/user'));

const makePlanner = (overrides: { name?: string; id?: string } = {}) => ({
	_id: overrides.id ?? '507f1f77bcf86cd799439011',
	name: overrides.name ?? "Test User's Planner",
	calendar: [],
	saved: [],
	tags: [],
});

const findReturns = (found: ReturnType<typeof makePlanner>[]) => {
	vi.mocked(planners.find).mockReturnValueOnce({
		toArray: async () => found,
	} as never);
};

describe('getPlanners', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('when user is not authenticated', () => {
		it('throws an error', async () => {
			vi.mocked(getUser).mockResolvedValueOnce(null as never);

			await expect(getPlanners()).rejects.toThrow('No user found');
		});
	});

	describe('when user is authenticated', () => {
		it('fetches planners by the user planner IDs', async () => {
			findReturns([makePlanner()]);

			await getPlanners();

			expect(planners.find).toHaveBeenCalledWith({
				_id: { $in: ['507f1f77bcf86cd799439011'] },
			});
		});

		it('returns the fetched planners with their access levels', async () => {
			const planner = makePlanner();
			findReturns([planner]);

			const result = await getPlanners();

			expect(result).toEqual([{ planner, accessLevel: 'owner' }]);
		});

		describe('access levels', () => {
			it('returns the correct access level for each planner', async () => {
				const mockUserWithMultiplePlanners = {
					name: 'Test User',
					planners: [
						{
							planner: '507f1f77bcf86cd799439011',
							accessLevel: 'owner',
						},
						{
							planner: '507f1f77bcf86cd799439012',
							accessLevel: 'write',
						},
						{
							planner: '507f1f77bcf86cd799439013',
							accessLevel: 'read',
						},
					],
				};
				const planner1 = makePlanner({
					id: '507f1f77bcf86cd799439011',
					name: 'Planner 1',
				});
				const planner2 = makePlanner({
					id: '507f1f77bcf86cd799439012',
					name: 'Planner 2',
				});
				const planner3 = makePlanner({
					id: '507f1f77bcf86cd799439013',
					name: 'Planner 3',
				});

				vi.mocked(getUser).mockResolvedValueOnce(
					mockUserWithMultiplePlanners as never,
				);
				findReturns([planner1, planner2, planner3]);

				const result = await getPlanners();

				expect(result).toEqual([
					{ planner: planner1, accessLevel: 'owner' },
					{ planner: planner2, accessLevel: 'write' },
					{ planner: planner3, accessLevel: 'read' },
				]);
			});

			it('defaults to read when access level is not found', async () => {
				const mockUserWithMissingAccess = {
					name: 'Test User',
					planners: [
						{
							planner: '507f1f77bcf86cd799439099',
							accessLevel: 'owner',
						},
					],
				};
				vi.mocked(getUser).mockResolvedValueOnce(
					mockUserWithMissingAccess as never,
				);
				findReturns([makePlanner({ id: '507f1f77bcf86cd799439011' })]);

				const result = await getPlanners();

				expect(result[0].accessLevel).toBe('read');
			});
		});
	});
});
