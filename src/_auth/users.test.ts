import { afterEach, describe, expect, test, vi } from 'vitest';

import {
	addAuthUserPassword,
	changeAuthUserEmail,
	deleteAuthUser,
	findAuthUser,
	linkAuthUserAccount,
} from './users';

const internalAdapter = {
	findUserByEmail: vi.fn(),
	updateUserByEmail: vi.fn(),
	linkAccount: vi.fn(),
	deleteUser: vi.fn(),
};
const hash = vi.fn();

const auth = {
	$context: Promise.resolve({ internalAdapter, password: { hash } }),
} as never;

const found = { user: { id: 'ba-user-id' }, accounts: [] };

describe('users', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('findAuthUser looks the user up by email with their accounts', async () => {
		internalAdapter.findUserByEmail.mockResolvedValueOnce(found);

		const result = await findAuthUser(auth, 'user@example.com');

		expect(result).toBe(found);
		expect(internalAdapter.findUserByEmail).toHaveBeenCalledWith(
			'user@example.com',
			{ includeAccounts: true },
		);
	});

	test('changeAuthUserEmail updates the user found by the current email', async () => {
		await changeAuthUserEmail(auth, 'old@example.com', 'new@example.com');

		expect(internalAdapter.updateUserByEmail).toHaveBeenCalledWith(
			'old@example.com',
			{ email: 'new@example.com' },
		);
	});

	describe('addAuthUserPassword', () => {
		test('returns false and links nothing when no user has the email', async () => {
			internalAdapter.findUserByEmail.mockResolvedValueOnce(null);

			const result = await addAuthUserPassword(
				auth,
				'user@example.com',
				'password123',
			);

			expect(result).toBe(false);
			expect(internalAdapter.linkAccount).not.toHaveBeenCalled();
		});

		test('links a credential account with the hashed password, keyed by the user id', async () => {
			internalAdapter.findUserByEmail.mockResolvedValueOnce(found);
			hash.mockResolvedValueOnce('hashed-password');

			const result = await addAuthUserPassword(
				auth,
				'user@example.com',
				'password123',
			);

			expect(result).toBe(true);
			expect(hash).toHaveBeenCalledWith('password123');
			expect(internalAdapter.linkAccount).toHaveBeenCalledWith({
				userId: 'ba-user-id',
				providerId: 'credential',
				accountId: 'ba-user-id',
				password: 'hashed-password',
			});
		});
	});

	test('linkAuthUserAccount links the account it is given', async () => {
		const account = {
			userId: 'ba-user-id',
			providerId: 'google',
			accountId: 'google-id',
		};

		await linkAuthUserAccount(auth, account);

		expect(internalAdapter.linkAccount).toHaveBeenCalledWith(account);
	});

	describe('deleteAuthUser', () => {
		test('deletes the user found by email', async () => {
			internalAdapter.findUserByEmail.mockResolvedValueOnce(found);

			await deleteAuthUser(auth, 'user@example.com');

			expect(internalAdapter.deleteUser).toHaveBeenCalledWith('ba-user-id');
		});

		test('deletes nothing when no user has the email', async () => {
			internalAdapter.findUserByEmail.mockResolvedValueOnce(null);

			await deleteAuthUser(auth, 'user@example.com');

			expect(internalAdapter.deleteUser).not.toHaveBeenCalled();
		});
	});
});
