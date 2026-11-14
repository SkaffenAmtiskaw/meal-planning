import { Resend } from 'resend';

import { reportError } from '@/_utils/reportError';
import { env } from '@/env';

import { resendError } from './_utils/resendError';

type Options = {
	user: { email: string };
	url: string;
};

const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationEmail = async ({ user, url }: Options) => {
	const { error } = await resend.emails.send({
		from: env.RESEND_FROM_EMAIL,
		to: user.email,
		subject: 'Verify your Meal Planner email',
		html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
	});

	if (error) await reportError(resendError(error));
};
