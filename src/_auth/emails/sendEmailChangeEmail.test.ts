import { describe, expect, test, vi } from 'vitest';

import { sendEmailChangeEmail } from './sendEmailChangeEmail';

const { mockSend, resendConstructor } = vi.hoisted(() => ({
	mockSend: vi.fn(),
	resendConstructor: vi.fn(),
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
