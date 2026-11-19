import { describe, expect, it } from 'vitest';

import { isNoSessionError, NO_SESSION_MESSAGE } from './noSessionError';

describe('isNoSessionError', () => {
	it('is true for the error getUser throws without a session', () => {
		expect(isNoSessionError(new Error(NO_SESSION_MESSAGE))).toBe(true);
	});

	it('is false for any other error', () => {
		expect(isNoSessionError(new Error('Database down'))).toBe(false);
	});

	it('is false for a thrown value that is not an Error', () => {
		expect(isNoSessionError(NO_SESSION_MESSAGE)).toBe(false);
	});
});
