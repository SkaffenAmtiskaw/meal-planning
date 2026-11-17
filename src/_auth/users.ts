import type { Auth } from 'better-auth';

/**
 * better-auth's own collections (user, account, session, verification) are reached only through
 * these functions, so better-auth stays the only code that knows how its data is stored. They wrap
 * its internal adapter, which isn't public API, so a better-auth upgrade that changes it touches
 * only this file. Each takes the auth instance, so the app passes its own and the factories and the
 * seed pass the test-only one in test/auth.ts. This file imports neither, nor `server-only`.
 */
type AuthContext = Awaited<Auth['$context']>;
type AuthInstance = {
	$context: Promise<{
		internalAdapter: AuthContext['internalAdapter'];
		password: Pick<AuthContext['password'], 'hash'>;
	}>;
};

export const findAuthUser = async (auth: AuthInstance, email: string) => {
	const { internalAdapter } = await auth.$context;
	return await internalAdapter.findUserByEmail(email, {
		includeAccounts: true,
	});
};

export const changeAuthUserEmail = async (
	auth: AuthInstance,
	email: string,
	newEmail: string,
) => {
	const { internalAdapter } = await auth.$context;
	await internalAdapter.updateUserByEmail(email, { email: newEmail });
};

/**
 * A credential account's accountId is its user's id, which is how better-auth's own sign-up stores
 * it and how its password updates find it. Returns false when no user has the email.
 */
export const addAuthUserPassword = async (
	auth: AuthInstance,
	email: string,
	password: string,
) => {
	const context = await auth.$context;
	const found = await context.internalAdapter.findUserByEmail(email);
	if (!found) return false;

	await context.internalAdapter.linkAccount({
		userId: found.user.id,
		providerId: 'credential',
		accountId: found.user.id,
		password: await context.password.hash(password),
	});
	return true;
};

export const linkAuthUserAccount = async (
	auth: AuthInstance,
	account: { userId: string; providerId: string; accountId: string },
) => {
	const { internalAdapter } = await auth.$context;
	return await internalAdapter.linkAccount(account);
};

// Also removes the user's sessions and accounts.
export const deleteAuthUser = async (auth: AuthInstance, email: string) => {
	const { internalAdapter } = await auth.$context;
	const found = await internalAdapter.findUserByEmail(email);
	if (found) await internalAdapter.deleteUser(found.user.id);
};
