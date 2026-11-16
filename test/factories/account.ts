import { auth } from '#auth';
import { linkAuthUserAccount } from '@/_auth/users';

// Links a Google account to the user, as signing in with Google would.
export const linkGoogleAccount = async (user: { id: string }) =>
	await linkAuthUserAccount(auth, {
		providerId: 'google',
		accountId: crypto.randomUUID(),
		userId: user.id,
	});
