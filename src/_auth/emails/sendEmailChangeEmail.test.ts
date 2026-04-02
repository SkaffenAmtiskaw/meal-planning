import { describe, expect, test, vi } from 'vitest';

import { sendEmailChangeEmail } from './sendEmailChangeEmail';

const {
	mockSend,
	resendConstructor,
	MOCK_RESEND_API_KEY,
	MOCK_RESEND_FROM_EMAIL,
} = vi.hoisted(() => ({
	mockSend: vi.fn(),
	resendConstructor: vi.fn(),
	MOCK_RESEND_API_KEY: 'mock-resend-api-key',
	MOCK_RESEND_FROM_EMAIL: 'from@example.com',
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

describe('sendEmailChangeEmail', () => {
	test('initializes Resend with the API key from env', () => {
		expect(resendConstructor).toHaveBeenCalledWith(MOCK_RESEND_API_KEY);
	});

	test('sends email to the new address with the verification url', async () => {
		const newEmail = 'new@example.com';
		const url = 'https://app.example.com/verify-email-change?token=abc123';

		await sendEmailChangeEmail({ newEmail, url });

		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({
				from: MOCK_RESEND_FROM_EMAIL,
				to: newEmail,
				html: expect.stringContaining(url),
			}),
		);
	});
});
