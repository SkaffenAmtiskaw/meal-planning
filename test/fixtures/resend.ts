import type { CreateEmailResponse } from 'resend';

/** What `resend.emails.send` resolves when Resend refuses the send, such as for a bad API key. */
export const makeRefusedSend = (): CreateEmailResponse => ({
	data: null,
	error: {
		name: 'invalid_api_key',
		message: 'API key is invalid',
		statusCode: 403,
	},
	headers: null,
});
