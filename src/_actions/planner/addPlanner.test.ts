import { afterEach, describe, expect, it, vi } from 'vitest';

import { Planner } from '@/_models/planner';

import { addPlanner } from './addPlanner';

vi.mock(
	'@/_models/planner',
	async () => await import('#mocks/@/_models/planner'),
);
vi.mock(
	'@/_models/database/newId',
	async () => await import('#mocks/@/_models/database/newId'),
);

describe('addPlanner', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	it('creates and returns a new planner with a new id, empty arrays and no name', async () => {
		const mockPlanner = { calendar: [], saved: [], tags: [] };
		vi.mocked(Planner.create).mockResolvedValue(mockPlanner as never);

		const result = await addPlanner();

		expect(vi.mocked(Planner.create).mock.calls[0][0]).toStrictEqual({
			_id: 'new-id',
			calendar: [],
			saved: [],
			tags: [],
		});
		expect(result).toBe(mockPlanner);
	});

	it('creates a planner with the provided name', async () => {
		const mockPlanner = {
			name: "Ursula's Planner",
			calendar: [],
			saved: [],
			tags: [],
		};
		vi.mocked(Planner.create).mockResolvedValue(mockPlanner as never);

		const result = await addPlanner("Ursula's Planner");

		expect(Planner.create).toHaveBeenCalledWith({
			_id: 'new-id',
			name: "Ursula's Planner",
			calendar: [],
			saved: [],
			tags: [],
		});
		expect(result).toBe(mockPlanner);
	});

	it('throws when Planner.create fails', async () => {
		vi.mocked(Planner.create).mockRejectedValue(new Error('DB error'));

		await expect(addPlanner()).rejects.toThrow('DB error');
	});
});
