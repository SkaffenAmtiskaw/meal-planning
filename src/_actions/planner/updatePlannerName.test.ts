import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';

import { updatePlannerName } from './updatePlannerName';

vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);
vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);

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
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await updatePlannerName(validId, 'New Name');

		expect(result).toEqual({ ok: false, error: 'Not authenticated.' });
	});

	test('returns error when planner does not belong to user', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await updatePlannerName(validId, 'New Name');

		expect(result).toEqual({ ok: false, error: 'Not authorized.' });
	});

	test('returns error when there is an auth error', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'error',
			error: new Error('DB error'),
		});

		const result = await updatePlannerName(validId, 'New Name');

		expect(result).toEqual({ ok: false, error: 'Not authorized.' });
	});

	test('updates planner name when authorized', async () => {
		const result = await updatePlannerName(validId, 'New Name');

		expect(checkAuth).toHaveBeenCalledWith(validId, 'admin');
		expect(planners.updateOne).toHaveBeenCalledWith(
			{ _id: validId },
			{ $set: { name: 'New Name' } },
		);
		expect(result).toEqual({ ok: true, data: undefined });
	});

	test('propagates error when DB update throws', async () => {
		vi.mocked(planners.updateOne).mockRejectedValue(new Error('DB error'));

		await expect(updatePlannerName(validId, 'New Name')).rejects.toThrow(
			'DB error',
		);
	});
});
