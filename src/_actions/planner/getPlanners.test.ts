import { afterEach, describe, expect, test, vi } from 'vitest';

import { getUser } from '@/_actions/user';
import { Planner } from '@/_models';
import type { AccessLevel } from '@/_models/user';

import { getPlanners, type PlannerWithAccess } from './getPlanners';

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
	calendar: [],
	saved: [],
	tags: [],
});

const mockUser = {
	name: 'Ariel',
	planners: [{ planner: 'planner-1', accessLevel: 'owner' }],
};

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
			_id: { $in: ['planner-1'] },
		});
	});

	test('returns planners that already have names without updating', async () => {
		const planner = makePlanner({ name: "Ariel's Planner" });
		vi.mocked(getUser).mockResolvedValueOnce(mockUser as never);
		vi.mocked(Planner.find).mockResolvedValueOnce([planner] as never);

		const result = await getPlanners();

		expect(Planner.collection.updateOne).not.toHaveBeenCalled();
		expect(result).toEqual([{ planner, accessLevel: 'owner' }]);
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

	test('returns access level for each planner', async () => {
		const planner = makePlanner({ name: "Ariel's Planner" });
		vi.mocked(getUser).mockResolvedValueOnce(mockUser as never);
		vi.mocked(Planner.find).mockResolvedValueOnce([planner] as never);

		const result = await getPlanners();

		expect(result).toEqual([{ planner, accessLevel: 'owner' }]);
		expect(result[0]).toHaveProperty('accessLevel', 'owner');
	});

	test('returns different access levels for different planners', async () => {
		const mockUserWithMultiplePlanners = {
			name: 'Ariel',
			planners: [
				{ planner: 'planner-1', accessLevel: 'owner' },
				{ planner: 'planner-2', accessLevel: 'write' },
				{ planner: 'planner-3', accessLevel: 'read' },
			],
		};
		const planner1 = makePlanner({ id: 'planner-1', name: 'Planner 1' });
		const planner2 = makePlanner({ id: 'planner-2', name: 'Planner 2' });
		const planner3 = makePlanner({ id: 'planner-3', name: 'Planner 3' });

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

	test('PlannerWithAccess type is exported', () => {
		// This is a type test, it should compile
		const mockId = {
			_id: expect.anything(),
			name: 'test',
			calendar: [],
			saved: [],
			tags: [],
		};
		const _typeCheck: PlannerWithAccess = {
			planner: mockId as PlannerWithAccess['planner'],
			accessLevel: 'owner' as AccessLevel,
		};
		expect(_typeCheck.accessLevel).toBe('owner');
	});

	test('should use default name fallback when planner name is undefined', async () => {
		// Create a planner where the name property cannot be set, testing the nullish coalescing fallback on line 54
		const plannerWithUndefinedName = {} as {
			_id: string;
			name: string | undefined;
			calendar: unknown[];
			saved: unknown[];
			tags: unknown[];
		};
		Object.defineProperty(plannerWithUndefinedName, '_id', {
			value: 'planner-1',
			enumerable: true,
		});
		// Define name as a getter that always returns undefined - this simulates a scenario where
		// the name cannot be set, forcing the nullish coalescing fallback on line 54 to execute
		Object.defineProperty(plannerWithUndefinedName, 'name', {
			get: () => undefined,
			set: () => {
				/* no-op: assignment is ignored, getter still returns undefined */
			},
			enumerable: true,
			configurable: true,
		});
		Object.defineProperty(plannerWithUndefinedName, 'calendar', {
			value: [],
			enumerable: true,
		});
		Object.defineProperty(plannerWithUndefinedName, 'saved', {
			value: [],
			enumerable: true,
		});
		Object.defineProperty(plannerWithUndefinedName, 'tags', {
			value: [],
			enumerable: true,
		});

		vi.mocked(getUser).mockResolvedValueOnce(mockUser as never);
		vi.mocked(Planner.find).mockResolvedValueOnce([
			plannerWithUndefinedName,
		] as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({} as never);

		const result = await getPlanners();

		expect(result[0].planner.name).toBe("Ariel's Planner");
	});

	test('should default to read access when accessLevel not found', async () => {
		const mockUserWithMissingAccess = {
			name: 'Ariel',
			planners: [{ planner: 'different-planner-id', accessLevel: 'owner' }],
		};
		const planner = makePlanner({ id: 'planner-1', name: "Ariel's Planner" });
		vi.mocked(getUser).mockResolvedValueOnce(
			mockUserWithMissingAccess as never,
		);
		vi.mocked(Planner.find).mockResolvedValueOnce([planner] as never);

		const result = await getPlanners();

		expect(result[0].accessLevel).toBe('read');
	});
});
