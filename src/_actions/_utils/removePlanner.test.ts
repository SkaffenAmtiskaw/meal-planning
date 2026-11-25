import { afterEach, describe, expect, it, vi } from 'vitest';

import { pendingInvites } from '@/_models/database/pendingInvites';
import { planners } from '@/_models/database/planners';
import { users } from '@/_models/database/users';

import { removePlanner } from './removePlanner';

vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);
vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
);
vi.mock(
	'@/_models/database/pendingInvites',
	async () => await import('#mocks/@/_models/database/pendingInvites'),
);

describe('removePlanner', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("removes the planner from every member's planner list", async () => {
		await removePlanner('planner-id');

		expect(users.updateMany).toHaveBeenCalledWith(
			{ 'planners.planner': 'planner-id' },
			{ $pull: { planners: { planner: 'planner-id' } } },
		);
	});

	it("deletes the planner's pending invites", async () => {
		await removePlanner('planner-id');

		expect(pendingInvites.deleteMany).toHaveBeenCalledWith({
			planner: 'planner-id',
		});
	});

	it('deletes the planner', async () => {
		await removePlanner('planner-id');

		expect(planners.deleteOne).toHaveBeenCalledWith({ _id: 'planner-id' });
	});

	it('keeps the planner when removing it from the members fails, so no member is left pointing at nothing', async () => {
		vi.mocked(users.updateMany).mockRejectedValueOnce(new Error('DB error'));

		await expect(removePlanner('planner-id')).rejects.toThrow('DB error');
		expect(planners.deleteOne).not.toHaveBeenCalled();
	});
});
