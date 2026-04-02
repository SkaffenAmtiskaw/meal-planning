import { describe, expect, test, vi } from 'vitest';

import { sendResetPasswordEmail } from './sendResetPasswordEmail';

const {
	mockSend,
	resendConstructor,
	MOCK_RESEND_API_KEY,
	MOCK_RESEND_FROM_EMAIL,
} = vi.hoisted(() => ({
	mockSend: vi.fn(),
	resendConstructor: vi.fn(),
	MOCK_RESEND_API_KEY: 'mock-resend-api-key',
	MOCK_RESEND_FROM_EMAIL: 'mock-resend-from-email',
}));

vi.mock('@/env', () => ({
	env: {
		RESEND_API_KEY: MOCK_RESEND_API_KEY,
		RESEND_FROM_EMAIL: MOCK_RESEND_FROM_EMAIL,
	},
}));

vi.mock('resend', () => ({
	// biome-ignore lint/complexity/useArrowFunction: arrow functions cannot be used as constructors
	Resend: vi.fn().mockImplementation(function (apiKey: string) {
		resendConstructor(apiKey);
		return { emails: { send: mockSend } };
	}),
}));

describe('send reset password email', () => {
	test('initialize resend with the API key from environment variables', () => {
		expect(resendConstructor).toHaveBeenCalledWith(MOCK_RESEND_API_KEY);
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
				from: MOCK_RESEND_FROM_EMAIL,
				to: MOCK_TO_EMAIL,
				html: expect.stringContaining(MOCK_URL),
			}),
		);
	});
});
