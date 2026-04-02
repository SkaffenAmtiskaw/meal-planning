import { afterEach, describe, expect, test, vi } from 'vitest';

import { auth } from '@/_auth';
import { Planner, User } from '@/_models';

import { deleteAccount } from './deleteAccount';

const {
	mockUserFindOne,
	mockDeleteMany,
	mockDeleteOne,
	mockCollection,
	mockSendAccountDeletionEmail,
} = vi.hoisted(() => {
	const mockUserFindOne = vi.fn();
	const mockDeleteMany = vi.fn();
	const mockDeleteOne = vi.fn();
	return {
		mockUserFindOne,
		mockDeleteMany,
		mockDeleteOne,
		mockCollection: vi.fn(() => ({
			findOne: mockUserFindOne,
			deleteMany: mockDeleteMany,
			deleteOne: mockDeleteOne,
		})),
		mockSendAccountDeletionEmail: vi.fn(),
	};
});

vi.mock('next/headers', () => ({
	headers: vi.fn().mockResolvedValue({}),
}));

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

vi.mock('@/_models', () => ({
	User: {
		findOne: vi.fn(),
		deleteOne: vi.fn(),
		countDocuments: vi.fn(),
	},
	Planner: {
		deleteOne: vi.fn(),
	},
}));

vi.mock('@/_auth/emails', () => ({
	sendAccountDeletionEmail: (opts: unknown) =>
		mockSendAccountDeletionEmail(opts),
}));

const mockSession = {
	user: { id: 'ba-user-id', email: 'user@example.com' },
};

const baUser = { _id: 'ba-mongo-id' };

const makeMockAppUser = (plannerIds: string[] = []) => ({
	email: 'user@example.com',
	planners: plannerIds,
});

const setupSuccess = (plannerIds: string[] = []) => {
	vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
	vi.mocked(User.findOne).mockReturnValueOnce({
		exec: vi.fn().mockResolvedValue(makeMockAppUser(plannerIds)),
	} as never);
	vi.mocked(User.deleteOne).mockReturnValueOnce({
		exec: vi.fn().mockResolvedValue({}),
	} as never);
	mockUserFindOne.mockResolvedValueOnce(baUser);
};

describe('deleteAccount', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('returns error when not authenticated', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as never);

		const result = await deleteAccount();

		expect(result).toEqual({ ok: false, error: 'Not authenticated.' });
	});

	test('returns error when user is not found in app database', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(null),
		} as never);

		const result = await deleteAccount();

		expect(result).toEqual({ ok: false, error: 'User not found.' });
	});

	test('deletes sole-owned planners', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi
				.fn()
				.mockResolvedValue(makeMockAppUser(['planner-1', 'planner-2'])),
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
		mockUserFindOne.mockResolvedValueOnce(baUser);

		await deleteAccount();

		expect(Planner.deleteOne).toHaveBeenCalledWith({ _id: 'planner-1' });
		expect(Planner.deleteOne).toHaveBeenCalledWith({ _id: 'planner-2' });
	});

	test('does not delete shared planners', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockAppUser(['shared-planner'])),
		} as never);
		vi.mocked(User.countDocuments).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(2),
		} as never);
		vi.mocked(User.deleteOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue({}),
		} as never);
		mockUserFindOne.mockResolvedValueOnce(baUser);

		await deleteAccount();

		expect(Planner.deleteOne).not.toHaveBeenCalled();
	});

	test('deletes the mongoose User document', async () => {
		setupSuccess();

		await deleteAccount();

		expect(User.deleteOne).toHaveBeenCalledWith({ email: 'user@example.com' });
	});

	test('looks up better-auth user by email', async () => {
		setupSuccess();

		await deleteAccount();

		expect(mockUserFindOne).toHaveBeenCalledWith({ email: 'user@example.com' });
	});

	test('deletes better-auth account, session, and verification records by _id', async () => {
		setupSuccess();

		await deleteAccount();

		expect(mockDeleteMany).toHaveBeenCalledWith({ userId: baUser._id });
		expect(mockCollection).toHaveBeenCalledWith('account');
		expect(mockCollection).toHaveBeenCalledWith('session');
		expect(mockCollection).toHaveBeenCalledWith('verification');
	});

	test('deletes the better-auth user record by _id', async () => {
		setupSuccess();

		await deleteAccount();

		expect(mockCollection).toHaveBeenCalledWith('user');
		expect(mockDeleteOne).toHaveBeenCalledWith({ _id: baUser._id });
	});

	test('skips better-auth deletions when no better-auth user record found', async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(mockSession as never);
		vi.mocked(User.findOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue(makeMockAppUser([])),
		} as never);
		vi.mocked(User.deleteOne).mockReturnValueOnce({
			exec: vi.fn().mockResolvedValue({}),
		} as never);
		mockUserFindOne.mockResolvedValueOnce(null);

		await deleteAccount();

		expect(mockDeleteMany).not.toHaveBeenCalled();
		expect(mockDeleteOne).not.toHaveBeenCalled();
	});

	test('sends deletion confirmation email', async () => {
		setupSuccess();

		await deleteAccount();

		expect(mockSendAccountDeletionEmail).toHaveBeenCalledWith({
			email: 'user@example.com',
		});
	});

	test('returns ok on success', async () => {
		setupSuccess();

		const result = await deleteAccount();

		expect(result).toEqual({ ok: true, data: undefined });
	});
});
