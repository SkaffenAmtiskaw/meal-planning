import { describe, expect, test, vi } from 'vitest';

import { sendAccountDeletionEmail } from './sendAccountDeletionEmail';

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

describe('sendAccountDeletionEmail', () => {
	test('initializes Resend with the API key', () => {
		expect(resendConstructor).toHaveBeenCalledWith('mock-resend-api-key');
	});

	test('sends deletion confirmation to the user email', async () => {
		await sendAccountDeletionEmail({ email: 'user@example.com' });

		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({
				from: 'from@example.com',
				to: 'user@example.com',
			}),
		);
	});
});
