import { describe, expect, it } from 'vitest';

import { resendError } from './resendError';

describe('resendError', () => {
	it("turns Resend's error response into an Error that names its code and message", () => {
		const response = {
			name: 'invalid_api_key' as const,
			message: 'API key is invalid',
			statusCode: 403,
		};

		const error = resendError(response);

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe('ResendError');
		expect(error.message).toBe('invalid_api_key: API key is invalid');
		expect(error.cause).toBe(response);
	});
});
