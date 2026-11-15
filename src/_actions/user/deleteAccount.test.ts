import { afterEach, describe, expect, it, vi } from 'vitest';

import { auth } from '@/_auth';
import { sendAccountDeletionEmail } from '@/_auth/emails';
import { deleteAuthUser } from '@/_auth/users';
import { Planner } from '@/_models/planner';
import { User } from '@/_models/user';

import { deleteAccount } from './deleteAccount';

vi.mock('next/headers', async () => await import('#mocks/next/headers'));

vi.mock('@/_models/user', async () => await import('#mocks/@/_models/user'));

vi.mock(
	'@/_models/planner',
	async () => await import('#mocks/@/_models/planner'),
);

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock('@/_auth/users', async () => await import('#mocks/@/_auth/users'));

vi.mock('@/_auth/emails', () => ({
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
	vi.mocked(User.findOne).mockReturnValueOnce({
		exec: vi.fn().mockResolvedValue(makeAppUser(plannerIds)),
	} as never);
	vi.mocked(User.deleteOne).mockReturnValueOnce({
		exec: vi.fn().mockResolvedValue({}),
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
			vi.mocked(User.findOne).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue(null),
			} as never);

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
			vi.mocked(User.countDocuments).mockImplementation(((filter: {
				'planners.planner': string;
			}) => ({
				exec: async () =>
					everyone.filter((planners) =>
						planners.includes(filter['planners.planner']),
					).length,
			})) as never);
			vi.mocked(Planner.deleteOne).mockReturnValue({
				exec: vi.fn().mockResolvedValue({}),
			} as never);
		};

		it('deletes a planner the user was the only member of', async () => {
			givenMembers({ deletingUser: ['solo-planner'] });

			await deleteAccount();

			expect(Planner.deleteOne).toHaveBeenCalledWith({ _id: 'solo-planner' });
		});

		it('keeps a planner that another user is also a member of', async () => {
			givenMembers({
				deletingUser: ['shared-planner'],
				otherUsers: [['shared-planner']],
			});

			await deleteAccount();

			expect(Planner.deleteOne).not.toHaveBeenCalled();
		});

		it('deletes only the planners no one else is a member of', async () => {
			givenMembers({
				deletingUser: ['solo-planner', 'shared-planner'],
				otherUsers: [['shared-planner'], ['unrelated-planner']],
			});

			await deleteAccount();

			expect(Planner.deleteOne).toHaveBeenCalledTimes(1);
			expect(Planner.deleteOne).toHaveBeenCalledWith({ _id: 'solo-planner' });
		});
	});

	describe('database cleanup', () => {
		it('deletes the app user document', async () => {
			setupSuccess();

			await deleteAccount();

			expect(User.deleteOne).toHaveBeenCalledWith({
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
