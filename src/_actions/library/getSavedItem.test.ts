import { afterEach, describe, expect, test, vi } from 'vitest';

import { getPlanner } from '@/_actions/planner/getPlanner';
import { newId } from '@/_models/database/newId';

import { getSavedItem } from './getSavedItem';

vi.mock(
	'@/_actions/planner/getPlanner',
	async () => await import('#mocks/@/_actions/planner/getPlanner'),
);

describe('getSavedItem', () => {
	const plannerId = newId();
	const itemId = newId();
	const mockItem = { _id: itemId, name: 'Maleficent Mushroom Soup' };

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('should return the item with the given id', async () => {
		vi.mocked(getPlanner).mockResolvedValue({
			saved: [{ _id: newId(), name: 'Evil Queen Apple Tart' }, mockItem],
		} as never);

		const result = await getSavedItem(plannerId, itemId);

		expect(getPlanner).toHaveBeenCalledWith(plannerId);
		expect(result).toBe(mockItem);
	});

	test('should throw when no item has the given id', async () => {
		vi.mocked(getPlanner).mockResolvedValue({
			saved: [{ _id: newId(), name: 'Evil Queen Apple Tart' }],
		} as never);

		await expect(getSavedItem(plannerId, itemId)).rejects.toThrow(
			`Item ${itemId} not found in planner ${plannerId}`,
		);
	});

	test('should throw when getPlanner fails', async () => {
		vi.mocked(getPlanner).mockRejectedValue(new Error('DB error'));

		await expect(getSavedItem(plannerId, itemId)).rejects.toThrow('DB error');
	});
});
