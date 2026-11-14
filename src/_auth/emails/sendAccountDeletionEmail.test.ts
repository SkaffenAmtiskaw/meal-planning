import { beforeEach, describe, expect, test, vi } from 'vitest';

import { makeRefusedSend } from '#fixtures/resend';
import { mockSend, resendConstructor } from '#mocks/resend';
import { reportError } from '@/_utils/reportError';

import { sendAccountDeletionEmail } from './sendAccountDeletionEmail';

vi.mock('resend', async () => await import('#mocks/resend'));
vi.mock(
	'@/_utils/reportError',
	async () => await import('#mocks/@/_utils/reportError'),
);

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

	describe('reporting', () => {
		beforeEach(() => {
			vi.mocked(reportError).mockClear();
		});

		test('reports the error Resend returns, and resolves', async () => {
			mockSend.mockResolvedValueOnce(makeRefusedSend());

			await expect(
				sendAccountDeletionEmail({ email: 'user@example.com' }),
			).resolves.toBeUndefined();

			expect(reportError).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'invalid_api_key: API key is invalid',
				}),
			);
		});

		test('reports nothing when the send succeeds', async () => {
			await sendAccountDeletionEmail({ email: 'user@example.com' });

			expect(reportError).not.toHaveBeenCalled();
		});
	});
});
