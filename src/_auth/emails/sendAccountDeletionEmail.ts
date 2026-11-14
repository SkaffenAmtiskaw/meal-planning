import { Resend } from 'resend';

import { reportError } from '@/_utils/reportError';
import { env } from '@/env';

import { resendError } from './_utils/resendError';

type Options = {
	email: string;
};

const resend = new Resend(env.RESEND_API_KEY);

export const sendAccountDeletionEmail = async ({ email }: Options) => {
	const { error } = await resend.emails.send({
		from: env.RESEND_FROM_EMAIL,
		to: email,
		subject: 'Your Meal Planner account has been deleted',
		html: '<p>Your account and all associated data have been permanently deleted.</p>',
	});

	if (error) await reportError(resendError(error));
};
