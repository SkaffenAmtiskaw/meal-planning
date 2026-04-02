import { Resend } from 'resend';

import { env } from '@/env';

type Options = {
	user: { email: string };
	url: string;
};

const resend = new Resend(env.RESEND_API_KEY);

export const sendResetPasswordEmail = async ({ user, url }: Options) => {
	await resend.emails.send({
		from: env.RESEND_FROM_EMAIL,
		to: user.email,
		subject: 'Reset your Meal Planner password',
		html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
	});
};
