import { mockSend, resendConstructor } from '@mocks/resend';

import { describe, expect, test, vi } from 'vitest';

import { sendAccountDeletionEmail } from './sendAccountDeletionEmail';

vi.mock('resend', async () => await import('@mocks/resend'));

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
