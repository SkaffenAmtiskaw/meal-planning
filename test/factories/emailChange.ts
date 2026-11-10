import type { UserInterface } from '@/_models/user';
import { User } from '@/_models/user';

import { uniqueEmail } from './uniqueEmail';

type PendingEmailChange = NonNullable<UserInterface['pendingEmailChange']>;

interface CreateEmailChangeRequestOptions {
	expiresAt?: Date;
}

// Writes a pending email change onto the user's User doc, as requesting one would, and returns its token.
export const createEmailChangeRequest = async (
	user: { email: string },
	{
		expiresAt = new Date(Date.now() + 60 * 60 * 1000),
	}: CreateEmailChangeRequestOptions = {},
) => {
	const pendingEmailChange: PendingEmailChange = {
		email: uniqueEmail(),
		token: crypto.randomUUID(),
		expiresAt,
	};

	const result = await User.updateOne(
		{ email: user.email },
		{ $set: { pendingEmailChange } },
	);
	if (result.matchedCount === 0)
		throw new Error(`No User doc matched ${user.email}`);

	return { token: pendingEmailChange.token, email: pendingEmailChange.email };
};
