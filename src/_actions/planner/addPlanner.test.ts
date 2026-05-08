import { afterEach, describe, expect, it, vi } from 'vitest';

import { Planner } from '@/_models/planner';

import { addPlanner } from './addPlanner';

vi.mock(
	'@/_models/planner',
	async () => await import('@mocks/@/_models/planner'),
);

describe('addPlanner', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	it('creates and returns a new planner with empty arrays and no name', async () => {
		const mockPlanner = { calendar: [], saved: [], tags: [] };
		vi.mocked(Planner.create).mockResolvedValue(mockPlanner as never);

		const result = await addPlanner();

		expect(Planner.create).toHaveBeenCalledWith({
			name: undefined,
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
