import { auth } from '#auth';

// Links a Google account to the user, as signing in with Google would.
export const linkGoogleAccount = async (user: { id: string }) => {
	const { internalAdapter } = await auth.$context;
	return await internalAdapter.createAccount({
		providerId: 'google',
		accountId: crypto.randomUUID(),
		userId: user.id,
	});
};
