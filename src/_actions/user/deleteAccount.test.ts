import { afterEach, describe, expect, it, vi } from 'vitest';

import { removePlanner } from '@/_actions/_utils/removePlanner';
import { auth } from '@/_auth';
import { deleteAuthUser } from '@/_auth/users';
import { sendAccountDeletionEmail } from '@/_email';
import { users } from '@/_models/database/users';
import type { PlannerMembership } from '@/_models/user';

import { deleteAccount } from './deleteAccount';

vi.mock('next/headers', async () => await import('#mocks/next/headers'));

vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
);

vi.mock('@/_actions/_utils/removePlanner', () => ({
	removePlanner: vi.fn(),
}));

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock('@/_auth/users', async () => await import('#mocks/@/_auth/users'));

vi.mock('@/_email', () => ({
	sendAccountDeletionEmail: vi.fn(),
}));

const mockSession = {
	user: { id: 'ba-user-id', email: 'user@example.com' },
};

type Membership = Pick<PlannerMembership, 'planner' | 'accessLevel'>;

const setupSuccess = (memberships: Membership[] = []) => {
	vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
	vi.mocked(users.findOne).mockResolvedValueOnce({
		email: 'user@example.com',
		planners: memberships,
	} as never);
};

describe('deleteAccount', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('authentication', () => {
		it('returns an error when the user is not authenticated', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

			const result = await deleteAccount();

			expect(result).toEqual({ ok: false, error: 'Not authenticated.' });
		});
	});

	describe('user lookup', () => {
		it('returns an error when the app user is not found', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			vi.mocked(users.findOne).mockResolvedValueOnce(null as never);

			const result = await deleteAccount();

			expect(result).toEqual({ ok: false, error: 'User not found.' });
		});
	});

	describe("the deleted user's planners", () => {
		/**
		 * Sets up the deleting user's memberships and every other stored user's planners. The count of a planner's
		 * members is worked out from them, as the database would, so each test reads as who belongs where.
		 */
		const givenMembers = ({
			deletingUser,
			otherUsers = [],
		}: {
			deletingUser: Membership[];
			otherUsers?: string[][];
		}) => {
			setupSuccess(deletingUser);
			const everyone = [
				deletingUser.map(({ planner }) => planner),
				...otherUsers,
			];
			vi.mocked(users.countDocuments).mockImplementation(
				(async (filter: { 'planners.planner': string }) =>
					everyone.filter((plannerIds) =>
						plannerIds.includes(filter['planners.planner']),
					).length) as never,
			);
		};

		it('removes a planner the user owns, even when others are members of it', async () => {
			givenMembers({
				deletingUser: [{ planner: 'owned-planner', accessLevel: 'owner' }],
				otherUsers: [['owned-planner']],
			});

			await deleteAccount();

			expect(removePlanner).toHaveBeenCalledWith('owned-planner');
		});

		it("keeps a shared planner the user doesn't own", async () => {
			givenMembers({
				deletingUser: [{ planner: 'shared-planner', accessLevel: 'write' }],
				otherUsers: [['shared-planner']],
			});

			await deleteAccount();

			expect(removePlanner).not.toHaveBeenCalled();
		});

		it("removes a planner the user was the only member of, even when they don't own it", async () => {
			givenMembers({
				deletingUser: [{ planner: 'solo-planner', accessLevel: 'admin' }],
			});

			await deleteAccount();

			expect(removePlanner).toHaveBeenCalledWith('solo-planner');
		});

		it('removes only the planners the user owns or was the only member of', async () => {
			givenMembers({
				deletingUser: [
					{ planner: 'owned-planner', accessLevel: 'owner' },
					{ planner: 'shared-planner', accessLevel: 'read' },
				],
				otherUsers: [['owned-planner', 'shared-planner']],
			});

			await deleteAccount();

			expect(removePlanner).toHaveBeenCalledTimes(1);
			expect(removePlanner).toHaveBeenCalledWith('owned-planner');
		});
	});

	describe('database cleanup', () => {
		it('deletes the app user document', async () => {
			setupSuccess();

			await deleteAccount();

			expect(users.deleteOne).toHaveBeenCalledWith({
				email: 'user@example.com',
			});
		});

		it('deletes the better-auth user by email', async () => {
			setupSuccess();

			await deleteAccount();

			expect(deleteAuthUser).toHaveBeenCalledWith(auth, 'user@example.com');
		});
	});

	describe('email notification', () => {
		it('sends a deletion confirmation email', async () => {
			setupSuccess();

			await deleteAccount();

			expect(sendAccountDeletionEmail).toHaveBeenCalledWith({
				email: 'user@example.com',
			});
		});
	});

	describe('return value', () => {
		it('returns ok on success', async () => {
			setupSuccess();

			const result = await deleteAccount();

			expect(result).toEqual({ ok: true, data: undefined });
		});
	});
});
