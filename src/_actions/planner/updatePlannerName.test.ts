import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Planner } from '@/_models';

import { updatePlannerName } from './updatePlannerName';

const mockCheckAuth = vi.hoisted(() => vi.fn());
vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: mockCheckAuth,
}));

vi.mock('@/_models', () => ({
	Planner: {
		collection: {
			updateOne: vi.fn(),
		},
	},
	zObjectId: {
		safeParse: (v: unknown) =>
			typeof v === 'string' && /^[0-9a-fA-F]{24}$/.test(v)
				? { success: true }
				: {
						success: false,
						error: { issues: [{ message: 'Invalid ObjectId' }] },
					},
	},
}));

const validId = '507f1f77bcf86cd799439011';

describe('updatePlannerName', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('returns error when planner ID is invalid', async () => {
		const result = await updatePlannerName('not-an-id', 'New Name');

		expect(result).toEqual({ ok: false, error: 'Invalid planner ID.' });
	});

	test('returns error when name is empty', async () => {
		const result = await updatePlannerName(validId, '');

		expect(result).toEqual({ ok: false, error: expect.any(String) });
	});

	test('returns error when name contains invalid characters', async () => {
		const result = await updatePlannerName(validId, 'Name <script>');

		expect(result).toEqual({ ok: false, error: expect.any(String) });
	});

	test('returns error when user is not authenticated', async () => {
		mockCheckAuth.mockResolvedValue({ type: 'unauthenticated' });

		const result = await updatePlannerName(validId, 'New Name');

		expect(result).toEqual({ ok: false, error: 'Not authenticated.' });
	});

	test('returns error when planner does not belong to user', async () => {
		mockCheckAuth.mockResolvedValue({ type: 'unauthorized' });

		const result = await updatePlannerName(validId, 'New Name');

		expect(result).toEqual({ ok: false, error: 'Not authorized.' });
	});

	test('returns error when there is an auth error', async () => {
		mockCheckAuth.mockResolvedValue({
			type: 'error',
			error: new Error('DB error'),
		});

		const result = await updatePlannerName(validId, 'New Name');

		expect(result).toEqual({ ok: false, error: 'Not authorized.' });
	});

	test('updates planner name when authorized', async () => {
		mockCheckAuth.mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({} as never);

		const result = await updatePlannerName(validId, 'New Name');

		expect(mockCheckAuth).toHaveBeenCalledWith(
			expect.any(Types.ObjectId),
			'admin',
		);
		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			{ _id: expect.objectContaining({}) },
			{ $set: { name: 'New Name' } },
		);
		expect(result).toEqual({ ok: true, data: undefined });
	});

	test('propagates error when DB update throws', async () => {
		mockCheckAuth.mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.collection.updateOne).mockRejectedValue(
			new Error('DB error'),
		);

		await expect(updatePlannerName(validId, 'New Name')).rejects.toThrow(
			'DB error',
		);
	});
});
