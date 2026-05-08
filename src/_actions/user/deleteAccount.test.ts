import { afterEach, describe, expect, it, vi } from 'vitest';

import { auth } from '@/_auth';
import { sendAccountDeletionEmail } from '@/_auth/emails';
import { Planner } from '@/_models/planner';
import { User } from '@/_models/user';

import { deleteAccount } from './deleteAccount';

const { mockCollection, mockBaFindOne, mockBaDeleteMany, mockBaDeleteOne } =
	vi.hoisted(() => ({
		mockBaFindOne: vi.fn(),
		mockBaDeleteMany: vi.fn(),
		mockBaDeleteOne: vi.fn(),
		mockCollection: vi.fn(() => ({
			findOne: mockBaFindOne,
			deleteMany: mockBaDeleteMany,
			deleteOne: mockBaDeleteOne,
		})),
	}));

vi.mock('next/headers', async () => await import('@mocks/next/headers'));

vi.mock('@/_models/user', async () => await import('@mocks/@/_models/user'));

vi.mock(
	'@/_models/planner',
	async () => await import('@mocks/@/_models/planner'),
);

vi.mock('@/_auth', () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
	mongoClient: {
		db: vi.fn(() => ({ collection: mockCollection })),
	},
}));

vi.mock('@/_auth/emails', () => ({
	sendAccountDeletionEmail: vi.fn(),
}));

const mockSession = {
	user: { id: 'ba-user-id', email: 'user@example.com' },
};

const baUser = { _id: 'ba-mongo-id' };

const makeAppUser = (plannerIds: string[] = []) => ({
	email: 'user@example.com',
	planners: plannerIds,
});

const setupSuccess = (plannerIds: string[] = []) => {
	vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
	vi.mocked(User.findOne).mockReturnValueOnce({
		exec: vi.fn().mockResolvedValue(makeAppUser(plannerIds)),
	} as never);
	vi.mocked(User.deleteOne).mockReturnValueOnce({
		exec: vi.fn().mockResolvedValue({}),
	} as never);
	mockBaFindOne.mockResolvedValueOnce(baUser);
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

	describe('planner cleanup', () => {
		it('deletes planners that are solely owned by the user', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			vi.mocked(User.findOne).mockReturnValueOnce({
				exec: vi
					.fn()
					.mockResolvedValue(makeAppUser(['planner-1', 'planner-2'])),
			} as never);
			vi.mocked(User.countDocuments)
				.mockReturnValueOnce({ exec: vi.fn().mockResolvedValue(1) } as never)
				.mockReturnValueOnce({ exec: vi.fn().mockResolvedValue(1) } as never);
			vi.mocked(User.deleteOne).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue({}),
			} as never);
			vi.mocked(Planner.deleteOne).mockReturnValue({
				exec: vi.fn().mockResolvedValue({}),
			} as never);
			mockBaFindOne.mockResolvedValueOnce(baUser);

			await deleteAccount();

			expect(Planner.deleteOne).toHaveBeenCalledWith({ _id: 'planner-1' });
			expect(Planner.deleteOne).toHaveBeenCalledWith({ _id: 'planner-2' });
		});

		it('does not delete planners shared with other users', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			vi.mocked(User.findOne).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue(makeAppUser(['shared-planner'])),
			} as never);
			vi.mocked(User.countDocuments).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue(2),
			} as never);
			vi.mocked(User.deleteOne).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue({}),
			} as never);
			mockBaFindOne.mockResolvedValueOnce(baUser);

			await deleteAccount();

			expect(Planner.deleteOne).not.toHaveBeenCalled();
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

		it('looks up the better-auth user by email', async () => {
			setupSuccess();

			await deleteAccount();

			expect(mockBaFindOne).toHaveBeenCalledWith({ email: 'user@example.com' });
		});

		it('deletes better-auth account, session, and verification records', async () => {
			setupSuccess();

			await deleteAccount();

			expect(mockCollection).toHaveBeenCalledWith('account');
			expect(mockCollection).toHaveBeenCalledWith('session');
			expect(mockCollection).toHaveBeenCalledWith('verification');
			expect(mockBaDeleteMany).toHaveBeenCalledWith({ userId: baUser._id });
		});

		it('deletes the better-auth user record', async () => {
			setupSuccess();

			await deleteAccount();

			expect(mockCollection).toHaveBeenCalledWith('user');
			expect(mockBaDeleteOne).toHaveBeenCalledWith({ _id: baUser._id });
		});

		it('skips better-auth cleanup when no better-auth user exists', async () => {
			vi.mocked(auth.api.getSession).mockResolvedValueOnce(
				mockSession as never,
			);
			vi.mocked(User.findOne).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue(makeAppUser([])),
			} as never);
			vi.mocked(User.deleteOne).mockReturnValueOnce({
				exec: vi.fn().mockResolvedValue({}),
			} as never);
			mockBaFindOne.mockResolvedValueOnce(null);

			await deleteAccount();

			expect(mockBaDeleteMany).not.toHaveBeenCalled();
			expect(mockBaDeleteOne).not.toHaveBeenCalled();
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
