import { beforeEach, describe, expect, it, vi } from 'vitest';

import { planners } from '@/_models/database/planners';

import { markSavedItemsUsed } from './markSavedItemsUsed';

vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);

const plannerId = '507f1f77bcf86cd799439011';
const usedAt = new Date('2026-11-26T10:00:00Z');

describe('markSavedItemsUsed', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('sets lastUsed on each named saved item in one write', async () => {
		await markSavedItemsUsed(plannerId, ['saved-1', 'saved-2'], usedAt);

		expect(planners.updateOne).toHaveBeenCalledOnce();
		expect(planners.updateOne).toHaveBeenCalledWith(
			{ _id: plannerId },
			{ $set: { 'saved.$[item].lastUsed': usedAt } },
			{ arrayFilters: [{ 'item._id': { $in: ['saved-1', 'saved-2'] } }] },
		);
	});

	it('writes nothing when no saved items are named', async () => {
		await markSavedItemsUsed(plannerId, [], usedAt);

		expect(planners.updateOne).not.toHaveBeenCalled();
	});
});
