import { Resend } from 'resend';

import { env } from '@/env';

type Options = {
	email: string;
};

const resend = new Resend(env.RESEND_API_KEY);

export const sendAccountDeletionEmail = async ({ email }: Options) => {
	await resend.emails.send({
		from: env.RESEND_FROM_EMAIL,
		to: email,
		subject: 'Your Meal Planner account has been deleted',
		html: '<p>Your account and all associated data have been permanently deleted.</p>',
	});
};
