import { Resend } from 'resend';

import { env } from '@/env';

type Options = {
	newEmail: string;
	url: string;
};

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmailChangeEmail = async ({ newEmail, url }: Options) => {
	await resend.emails.send({
		from: env.RESEND_FROM_EMAIL,
		to: newEmail,
		subject: 'Confirm your new Meal Planner email',
		html: `<p>Click <a href="${url}">here</a> to confirm your new email address.</p>`,
	});
};
