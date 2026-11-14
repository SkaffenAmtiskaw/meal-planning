import { beforeEach, describe, expect, test, vi } from 'vitest';

import { makeRefusedSend } from '#fixtures/resend';
import { mockSend, resendConstructor } from '#mocks/resend';
import { reportError } from '@/_utils/reportError';

import { sendEmailChangeEmail } from './sendEmailChangeEmail';

vi.mock('resend', async () => await import('#mocks/resend'));
vi.mock(
	'@/_utils/reportError',
	async () => await import('#mocks/@/_utils/reportError'),
);

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

	describe('reporting', () => {
		const options = {
			newEmail: 'new@example.com',
			url: 'https://app.example.com/verify-email-change?token=abc123',
		};

		beforeEach(() => {
			vi.mocked(reportError).mockClear();
		});

		test('reports the error Resend returns, and resolves', async () => {
			mockSend.mockResolvedValueOnce(makeRefusedSend());

			await expect(sendEmailChangeEmail(options)).resolves.toBeUndefined();

			expect(reportError).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'invalid_api_key: API key is invalid',
				}),
			);
		});

		test('reports nothing when the send succeeds', async () => {
			await sendEmailChangeEmail(options);

			expect(reportError).not.toHaveBeenCalled();
		});
	});
});
