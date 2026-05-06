import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getUser } from '@/_actions/user';
import { Planner } from '@/_models';

import { getPlanners } from './getPlanners';

vi.mock('@/_models', async () => ({
	Planner: {
		find: vi.fn(),
		collection: {
			updateOne: vi.fn(),
		},
	},
}));

vi.mock('@/_actions/user', async () => await import('@mocks/@/_actions/user'));

const makePlanner = (overrides: { name?: string; id?: string } = {}) => ({
	_id: overrides.id ?? '507f1f77bcf86cd799439011',
	name: overrides.name,
	calendar: [],
	saved: [],
	tags: [],
});

describe('getPlanners', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('throws when no user found', async () => {
		vi.mocked(getUser).mockResolvedValueOnce(null as never);

		await expect(getPlanners()).rejects.toThrow('No user found');
	});

	test('fetches planners by the user planner IDs', async () => {
		const planner = makePlanner({ name: "Test User's Planner" });
		vi.mocked(Planner.find).mockResolvedValueOnce([planner] as never);

		await getPlanners();

		expect(Planner.find).toHaveBeenCalledWith({
			_id: { $in: [expect.any(Object)] },
		});
	});

	test('returns planners that already have names without updating', async () => {
		const planner = makePlanner({ name: "Test User's Planner" });
		vi.mocked(Planner.find).mockResolvedValueOnce([planner] as never);

		const result = await getPlanners();

		expect(Planner.collection.updateOne).not.toHaveBeenCalled();
		expect(result).toEqual([{ planner, accessLevel: 'owner' }]);
	});

	test('seeds name via collection.updateOne for planners that have no name', async () => {
		const planner = makePlanner();
		vi.mocked(Planner.find).mockResolvedValueOnce([planner] as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({} as never);

		await getPlanners();

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			{ _id: '507f1f77bcf86cd799439011' },
			{ $set: { name: "Test User's Planner" } },
		);
		expect(planner.name).toBe("Test User's Planner");
	});

	test('only seeds planners that have no name', async () => {
		const named = makePlanner({
			name: "Test User's Planner",
			id: '507f1f77bcf86cd799439021',
		});
		const unnamed = makePlanner({ id: '507f1f77bcf86cd799439022' });
		vi.mocked(Planner.find).mockResolvedValueOnce([named, unnamed] as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({} as never);

		await getPlanners();

		expect(Planner.collection.updateOne).toHaveBeenCalledTimes(1);
		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			{ _id: '507f1f77bcf86cd799439022' },
			{ $set: { name: "Test User's Planner" } },
		);
		expect(unnamed.name).toBe("Test User's Planner");
		expect(named.name).toBe("Test User's Planner");
	});

	test('returns access level for each planner', async () => {
		const planner = makePlanner({ name: "Test User's Planner" });
		vi.mocked(Planner.find).mockResolvedValueOnce([planner] as never);

		const result = await getPlanners();

		expect(result).toEqual([{ planner, accessLevel: 'owner' }]);
	});

	test('returns different access levels for different planners', async () => {
		const mockUserWithMultiplePlanners = {
			name: 'Test User',
			planners: [
				{ planner: '507f1f77bcf86cd799439011', accessLevel: 'owner' },
				{ planner: '507f1f77bcf86cd799439012', accessLevel: 'write' },
				{ planner: '507f1f77bcf86cd799439013', accessLevel: 'read' },
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
		vi.mocked(Planner.find).mockResolvedValueOnce([
			planner1,
			planner2,
			planner3,
		] as never);

		const result = await getPlanners();

		expect(result).toEqual([
			{ planner: planner1, accessLevel: 'owner' },
			{ planner: planner2, accessLevel: 'write' },
			{ planner: planner3, accessLevel: 'read' },
		]);
	});

	test('uses default name fallback when planner name is undefined', async () => {
		const planner = {
			_id: '507f1f77bcf86cd799439011',
			get name() {
				return undefined;
			},
			set name(_: string | undefined) {
				// no-op
			},
			calendar: [],
			saved: [],
			tags: [],
		};
		vi.mocked(Planner.find).mockResolvedValueOnce([planner] as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({} as never);

		const result = await getPlanners();

		expect(result[0].planner.name).toBe("Test User's Planner");
	});

	test('defaults to read access when accessLevel not found', async () => {
		const mockUserWithMissingAccess = {
			name: 'Test User',
			planners: [{ planner: '507f1f77bcf86cd799439099', accessLevel: 'owner' }],
		};
		const planner = makePlanner({
			id: '507f1f77bcf86cd799439011',
			name: "Test User's Planner",
		});
		vi.mocked(getUser).mockResolvedValueOnce(
			mockUserWithMissingAccess as never,
		);
		vi.mocked(Planner.find).mockResolvedValueOnce([planner] as never);

		const result = await getPlanners();

		expect(result[0].accessLevel).toBe('read');
	});
});
