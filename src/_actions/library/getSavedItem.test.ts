import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { getPlanner } from '@/_actions/planner';
import { matchesId } from '@/_utils/matchesId';

import { getSavedItem } from './getSavedItem';

vi.mock(
	'@/_actions/planner',
	async () => await import('@mocks/@/_actions/planner'),
);
vi.mock('@/_utils/matchesId', () => ({
	matchesId: vi.fn(),
}));

describe('getSavedItem', () => {
	const plannerId = new Types.ObjectId();
	const itemId = new Types.ObjectId();
	const mockItem = { _id: itemId, name: 'Maleficent Mushroom Soup' };

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('should return the item when found in the planner', async () => {
		vi.mocked(getPlanner).mockResolvedValue({
			saved: [mockItem],
		} as never);
		vi.mocked(matchesId).mockReturnValue(() => true);

		const result = await getSavedItem(plannerId, itemId);

		expect(getPlanner).toHaveBeenCalledWith(plannerId);
		expect(matchesId).toHaveBeenCalledWith(itemId);
		expect(result).toBe(mockItem);
	});

	test('should throw when the item is not found in the planner', async () => {
		vi.mocked(getPlanner).mockResolvedValue({ saved: [] } as never);
		vi.mocked(matchesId).mockReturnValue(() => false);

		await expect(getSavedItem(plannerId, itemId)).rejects.toThrow(
			`Item ${itemId} not found in planner ${plannerId}`,
		);
	});

	test('should throw when getPlanner fails', async () => {
		vi.mocked(getPlanner).mockRejectedValue(new Error('DB error'));

		await expect(getSavedItem(plannerId, itemId)).rejects.toThrow('DB error');
	});
});
