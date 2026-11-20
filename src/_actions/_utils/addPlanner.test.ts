import { afterEach, describe, expect, it, vi } from 'vitest';

import { planners } from '@/_models/database/planners';

import { addPlanner } from './addPlanner';

vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);
vi.mock(
	'@/_models/database/newId',
	async () => await import('#mocks/@/_models/database/newId'),
);

describe('addPlanner', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('inserts and returns a new planner with a new id, the given name and empty arrays', async () => {
		const result = await addPlanner("Ursula's Planner");

		const planner = {
			_id: 'new-id',
			name: "Ursula's Planner",
			calendar: [],
			saved: [],
			tags: [],
		};
		expect(vi.mocked(planners.insertOne).mock.calls[0][0]).toStrictEqual(
			planner,
		);
		expect(result).toStrictEqual(planner);
	});

	it('throws when the insert fails', async () => {
		vi.mocked(planners.insertOne).mockRejectedValueOnce(new Error('DB error'));

		await expect(addPlanner("Ursula's Planner")).rejects.toThrow('DB error');
	});
});
