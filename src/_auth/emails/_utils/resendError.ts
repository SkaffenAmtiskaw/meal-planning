import type { ErrorResponse } from 'resend';

/**
 * Turns the error Resend returns into an Error, so a report of it gets a type, a message and a
 * stack trace.
 */
export const resendError = (response: ErrorResponse) => {
	const error = new Error(`${response.name}: ${response.message}`, {
		cause: response,
	});
	error.name = 'ResendError';
	return error;
};
