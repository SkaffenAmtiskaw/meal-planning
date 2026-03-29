import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { getPlanner } from '@/_actions';

import { getSavedItem } from './getSavedItem';

vi.mock('@/_actions', () => ({
	getPlanner: vi.fn(),
}));

describe('get saved item', () => {
	const plannerId = new Types.ObjectId();
	const itemId = new Types.ObjectId();

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('should return the item when found in the planner', async () => {
		const mockItem = { _id: itemId, name: 'Maleficent Mushroom Soup' };
		vi.mocked(getPlanner).mockResolvedValue({
			saved: [mockItem],
		} as never);

		const result = await getSavedItem(plannerId, itemId);

		expect(getPlanner).toHaveBeenCalledWith(plannerId);
		expect(result).toBe(mockItem);
	});

	test('should find the item by string comparison when _id is an ObjectId instance', async () => {
		const objectIdInstance = new Types.ObjectId(itemId.toString());
		const mockItem = {
			_id: objectIdInstance,
			name: 'Maleficent Mushroom Soup',
		};
		vi.mocked(getPlanner).mockResolvedValue({
			saved: [mockItem],
		} as never);

		const result = await getSavedItem(plannerId, itemId);

		expect(result).toBe(mockItem);
	});

	test('should throw when the item is not found in the planner', async () => {
		vi.mocked(getPlanner).mockResolvedValue({ saved: [] } as never);

		await expect(getSavedItem(plannerId, itemId)).rejects.toThrow(
			`Item ${itemId} not found in planner ${plannerId}`,
		);
	});

	test('should throw when get planner fails', async () => {
		vi.mocked(getPlanner).mockRejectedValue(new Error('DB error'));

		await expect(getSavedItem(plannerId, itemId)).rejects.toThrow('DB error');
	});
});
