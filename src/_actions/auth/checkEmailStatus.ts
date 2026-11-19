'use server';

import { auth } from '@/_auth';
import { findAuthUser } from '@/_auth/users';

type EmailStatus = 'new' | 'has-password' | 'social-only';

export const checkEmailStatus = async (email: string): Promise<EmailStatus> => {
	const found = await findAuthUser(auth, email);

	if (!found) return 'new';

	return found.accounts.some(({ providerId }) => providerId === 'credential')
		? 'has-password'
		: 'social-only';
};
