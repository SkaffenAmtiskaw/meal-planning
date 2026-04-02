'use server';

import { mongoClient } from '@/_auth';

export type EmailStatus = 'new' | 'has-password' | 'social-only';

export const checkEmailStatus = async (email: string): Promise<EmailStatus> => {
	const db = mongoClient.db();

	const user = await db.collection('user').findOne({ email });

	if (!user) return 'new';

	const credentialAccount = await db
		.collection('account')
		.findOne({ userId: user._id, providerId: 'credential' });

	return credentialAccount ? 'has-password' : 'social-only';
};
