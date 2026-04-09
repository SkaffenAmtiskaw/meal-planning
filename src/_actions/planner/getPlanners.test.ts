import { afterEach, describe, expect, test, vi } from 'vitest';

import { getUser } from '@/_actions/user';
import { Planner } from '@/_models';

import { getPlanners } from './getPlanners';

vi.mock('@/_models', () => ({
	Planner: {
		find: vi.fn(),
		collection: {
			updateOne: vi.fn(),
		},
	},
}));

vi.mock('@/_actions/user', () => ({
	getUser: vi.fn(),
}));

const makePlanner = (overrides: { name?: string; id?: string } = {}) => ({
	_id: overrides.id ?? 'planner-1',
	name: overrides.name,
});

const mockUser = { name: 'Ariel', planners: ['planner-1'] };

describe('getPlanners', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('throws when no user found', async () => {
		vi.mocked(getUser).mockResolvedValueOnce(null as never);

		await expect(getPlanners()).rejects.toThrow('No user found');
	});

	test('fetches planners by the user planner IDs', async () => {
		const planner = makePlanner({ name: "Ariel's Planner" });
		vi.mocked(getUser).mockResolvedValueOnce(mockUser as never);
		vi.mocked(Planner.find).mockResolvedValueOnce([planner] as never);

		await getPlanners();

		expect(Planner.find).toHaveBeenCalledWith({
			_id: { $in: mockUser.planners },
		});
	});

	test('returns planners that already have names without updating', async () => {
		const planner = makePlanner({ name: "Ariel's Planner" });
		vi.mocked(getUser).mockResolvedValueOnce(mockUser as never);
		vi.mocked(Planner.find).mockResolvedValueOnce([planner] as never);

		const result = await getPlanners();

		expect(Planner.collection.updateOne).not.toHaveBeenCalled();
		expect(result).toEqual([planner]);
	});

	test('seeds name via collection.updateOne for planners that have no name', async () => {
		const planner = makePlanner();
		vi.mocked(getUser).mockResolvedValueOnce(mockUser as never);
		vi.mocked(Planner.find).mockResolvedValueOnce([planner] as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({} as never);

		await getPlanners();

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			{ _id: planner._id },
			{ $set: { name: "Ariel's Planner" } },
		);
		expect(planner.name).toBe("Ariel's Planner");
	});

	test('only seeds planners that have no name', async () => {
		const named = makePlanner({ name: "Ariel's Planner", id: 'p1' });
		const unnamed = makePlanner({ id: 'p2' });
		vi.mocked(getUser).mockResolvedValueOnce(mockUser as never);
		vi.mocked(Planner.find).mockResolvedValueOnce([named, unnamed] as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({} as never);

		await getPlanners();

		expect(Planner.collection.updateOne).toHaveBeenCalledTimes(1);
		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			{ _id: unnamed._id },
			{ $set: { name: "Ariel's Planner" } },
		);
		expect(unnamed.name).toBe("Ariel's Planner");
		expect(named.name).toBe("Ariel's Planner");
	});
});
