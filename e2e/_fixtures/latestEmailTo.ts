import { expect } from '@playwright/test';

import { type Email, emailsTo } from './emailsTo';

// The newest email sent to the recipient, waiting for one to arrive. Fails naming the recipient if none does.
export const latestEmailTo = async (recipient: string) => {
	let emails: Email[] = [];
	await expect
		.poll(
			async () => {
				emails = await emailsTo(recipient);
				return emails.length;
			},
			{ message: `No email reached ${recipient}` },
		)
		.toBeGreaterThan(0);
	return emails[emails.length - 1];
};
