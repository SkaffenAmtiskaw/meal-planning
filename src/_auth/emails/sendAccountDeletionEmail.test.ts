import { describe, expect, test, vi } from 'vitest';

import { sendAccountDeletionEmail } from './sendAccountDeletionEmail';

const {
	mockSend,
	resendConstructor,
	MOCK_RESEND_API_KEY,
	MOCK_RESEND_FROM_EMAIL,
} = vi.hoisted(() => ({
	mockSend: vi.fn(),
	resendConstructor: vi.fn(),
	MOCK_RESEND_API_KEY: 'mock-resend-api-key',
	MOCK_RESEND_FROM_EMAIL: 'noreply@example.com',
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

describe('sendAccountDeletionEmail', () => {
	test('initializes Resend with the API key', () => {
		expect(resendConstructor).toHaveBeenCalledWith(MOCK_RESEND_API_KEY);
	});

	test('sends deletion confirmation to the user email', async () => {
		await sendAccountDeletionEmail({ email: 'user@example.com' });

		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({
				from: MOCK_RESEND_FROM_EMAIL,
				to: 'user@example.com',
			}),
		);
	});
});
