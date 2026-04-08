import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { getPlannerClient } from './getPlannerClient';

const mockGetPlanner = vi.fn();
vi.mock('./getPlanner', () => ({
	getPlanner: (...args: unknown[]) => mockGetPlanner(...args),
}));

describe('getPlannerClient', () => {
	const mockId = '507f1f77bcf86cd799439011';

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('returns serialized plain object with ObjectIds converted to strings', async () => {
		const id = new Types.ObjectId();
		const rawPlanner = {
			calendar: [],
			saved: [],
			tags: [{ _id: id, name: 'tag', color: 'red' }],
		};
		const mockDocument = { toObject: vi.fn().mockReturnValue(rawPlanner) };
		mockGetPlanner.mockResolvedValue(mockDocument);

		const result = await getPlannerClient(mockId);

		expect(mockGetPlanner).toHaveBeenCalledWith(mockId);
		expect(mockDocument.toObject).toHaveBeenCalled();
		expect(result).toEqual({
			calendar: [],
			saved: [],
			tags: [{ _id: id.toString(), name: 'tag', color: 'red' }],
		});
	});

	test('propagates errors from getPlanner', async () => {
		mockGetPlanner.mockRejectedValue(new Error('not found'));

		await expect(getPlannerClient(mockId)).rejects.toThrow('not found');
	});
});
