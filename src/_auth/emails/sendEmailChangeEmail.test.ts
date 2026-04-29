import { mockSend, resendConstructor } from '@mocks/resend';

import { describe, expect, test, vi } from 'vitest';

import { sendEmailChangeEmail } from './sendEmailChangeEmail';

vi.mock('resend', async () => await import('@mocks/resend'));

describe('sendEmailChangeEmail', () => {
	test('initializes Resend with the API key from env', () => {
		expect(resendConstructor).toHaveBeenCalledWith('mock-resend-api-key');
	});

	test('sends email to the new address with the verification url', async () => {
		const newEmail = 'new@example.com';
		const url = 'https://app.example.com/verify-email-change?token=abc123';

		await sendEmailChangeEmail({ newEmail, url });

		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({
				from: 'from@example.com',
				to: newEmail,
				html: expect.stringContaining(url),
			}),
		);
	});
});
