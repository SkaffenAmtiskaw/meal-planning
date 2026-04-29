import { Resend } from 'resend';

import { env } from '@/env';

type InviteEmailType = 'existing_user' | 'new_user';

interface SendInviteEmailOptions {
	email: string;
	plannerName: string;
	inviterName: string;
	acceptUrl: string;
	type: InviteEmailType;
}

const resend = new Resend(env.RESEND_API_KEY);

export const sendInviteEmail = async ({
	email,
	plannerName,
	inviterName,
	acceptUrl,
	type,
}: SendInviteEmailOptions): Promise<void> => {
	const subject = `You've been invited to join ${plannerName} on Meal Planner`;

	let html: string;

	if (type === 'existing_user') {
		html = `<p>${inviterName} has invited you to join "${plannerName}" on Meal Planner.</p>
<p>Click <a href="${acceptUrl}">here</a> to accept or decline the invitation.</p>`;
	} else {
		html = `<p>${inviterName} has invited you to join "${plannerName}" on Meal Planner.</p>
<p>To accept this invitation, you need to create an account first.</p>
<p>Click <a href="${acceptUrl}">here</a> to sign up and accept the invitation.</p>`;
	}

	await resend.emails.send({
		from: env.RESEND_FROM_EMAIL,
		to: email,
		subject,
		html,
	});
};
