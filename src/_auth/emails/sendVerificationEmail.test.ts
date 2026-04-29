import { mockSend, resendConstructor } from '@mocks/resend';

import { describe, expect, test, vi } from 'vitest';

import { sendVerificationEmail } from './sendVerificationEmail';

vi.mock('resend', async () => await import('@mocks/resend'));

describe('send verification email', () => {
	test('initialize resend with the API key from environment variables', () => {
		expect(resendConstructor).toHaveBeenCalledWith('mock-resend-api-key');
	});

	test('should accept a user and a return url', async () => {
		const MOCK_TO_EMAIL = 'foo@bar.com';
		const MOCK_URL = 'https://foo.com';

		await sendVerificationEmail({
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
