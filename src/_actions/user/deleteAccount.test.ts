import { afterEach, describe, expect, it, vi } from 'vitest';

import { auth } from '@/_auth';
import { deleteAuthUser } from '@/_auth/users';
import { sendAccountDeletionEmail } from '@/_email';
import { planners } from '@/_models/database/planners';
import { users } from '@/_models/database/users';

import { deleteAccount } from './deleteAccount';

vi.mock('next/headers', async () => await import('#mocks/next/headers'));

vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
);

vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);

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

const makeAppUser = (plannerIds: string[] = []) => ({
	email: 'user@example.com',
	planners: plannerIds.map((planner) => ({ planner, accessLevel: 'owner' })),
});

const setupSuccess = (plannerIds: string[] = []) => {
	vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
	vi.mocked(users.findOne).mockResolvedValueOnce(
		makeAppUser(plannerIds) as never,
	);
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
		 * Sets up the deleting user and every other stored user by their planner memberships. The count of a
		 * planner's members is worked out from them, as the database would, so each test reads as who belongs where.
		 */
		const givenMembers = ({
			deletingUser,
			otherUsers = [],
		}: {
			deletingUser: string[];
			otherUsers?: string[][];
		}) => {
			setupSuccess(deletingUser);
			const everyone = [deletingUser, ...otherUsers];
			vi.mocked(users.countDocuments).mockImplementation(
				(async (filter: { 'planners.planner': string }) =>
					everyone.filter((memberships) =>
						memberships.includes(filter['planners.planner']),
					).length) as never,
			);
		};

		it('deletes a planner the user was the only member of', async () => {
			givenMembers({ deletingUser: ['solo-planner'] });

			await deleteAccount();

			expect(planners.deleteOne).toHaveBeenCalledWith({ _id: 'solo-planner' });
		});

		it('keeps a planner that another user is also a member of', async () => {
			givenMembers({
				deletingUser: ['shared-planner'],
				otherUsers: [['shared-planner']],
			});

			await deleteAccount();

			expect(planners.deleteOne).not.toHaveBeenCalled();
		});

		it('deletes only the planners no one else is a member of', async () => {
			givenMembers({
				deletingUser: ['solo-planner', 'shared-planner'],
				otherUsers: [['shared-planner'], ['unrelated-planner']],
			});

			await deleteAccount();

			expect(planners.deleteOne).toHaveBeenCalledTimes(1);
			expect(planners.deleteOne).toHaveBeenCalledWith({ _id: 'solo-planner' });
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
