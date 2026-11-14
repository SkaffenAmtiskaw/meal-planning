import { beforeEach, describe, expect, test, vi } from 'vitest';

import { makeRefusedSend } from '#fixtures/resend';
import { mockSend, resendConstructor } from '#mocks/resend';
import { reportError } from '@/_utils/reportError';

import { sendVerificationEmail } from './sendVerificationEmail';

vi.mock('resend', async () => await import('#mocks/resend'));
vi.mock(
	'@/_utils/reportError',
	async () => await import('#mocks/@/_utils/reportError'),
);

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

	describe('reporting', () => {
		const options = {
			user: { email: 'foo@bar.com' },
			url: 'https://foo.com',
		};

		beforeEach(() => {
			vi.mocked(reportError).mockClear();
		});

		test('reports the error Resend returns, and resolves', async () => {
			mockSend.mockResolvedValueOnce(makeRefusedSend());

			await expect(sendVerificationEmail(options)).resolves.toBeUndefined();

			expect(reportError).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'invalid_api_key: API key is invalid',
				}),
			);
		});

		test('reports nothing when the send succeeds', async () => {
			await sendVerificationEmail(options);

			expect(reportError).not.toHaveBeenCalled();
		});
	});
});
