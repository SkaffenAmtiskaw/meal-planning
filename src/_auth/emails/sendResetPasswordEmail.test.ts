import { mockSend, resendConstructor } from '@mocks/resend';

import { describe, expect, test, vi } from 'vitest';

import { sendResetPasswordEmail } from './sendResetPasswordEmail';

vi.mock('resend', async () => await import('@mocks/resend'));

describe('send reset password email', () => {
	test('initialize resend with the API key from environment variables', () => {
		expect(resendConstructor).toHaveBeenCalledWith('mock-resend-api-key');
	});

	test('should accept a user and a return url', async () => {
		const MOCK_TO_EMAIL = 'foo@bar.com';
		const MOCK_URL = 'https://foo.com/reset';

		await sendResetPasswordEmail({
			user: { email: MOCK_TO_EMAIL },
			url: MOCK_URL,
		});

		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({
				from: 'from@example.com',
				to: MOCK_TO_EMAIL,
				html: expect.stringContaining(MOCK_URL),
			}),
		);
	});
});
