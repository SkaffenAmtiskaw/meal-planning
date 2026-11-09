import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PostHog } from 'posthog-node';

import { getReportingToken } from '@/_utils/errorReporting';

const captureExceptionImmediate = vi.hoisted(() => vi.fn());

vi.mock('posthog-node', () => ({
	// biome-ignore lint/complexity/useArrowFunction: arrow functions cannot be used as constructors
	PostHog: vi.fn().mockImplementation(function () {
		return { captureExceptionImmediate };
	}),
}));
vi.mock('@/_utils/errorReporting', () => ({
	getReportingToken: vi.fn(() => 'phc_token'),
	POSTHOG_HOST: 'https://posthog.example.com',
}));

const loadReportError = async () => (await import('./reportError')).reportError;

describe('reportError', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	it('sends the error to PostHog with no distinct ID, so it creates no person profile', async () => {
		const reportError = await loadReportError();
		const error = new Error('boom');

		await reportError(error);

		expect(PostHog).toHaveBeenCalledWith('phc_token', {
			host: 'https://posthog.example.com',
		});
		expect(captureExceptionImmediate).toHaveBeenCalledWith(error);
	});

	it('waits for the send to finish', async () => {
		const reportError = await loadReportError();
		let sent = false;
		captureExceptionImmediate.mockImplementationOnce(async () => {
			await Promise.resolve();
			sent = true;
		});

		await reportError(new Error('boom'));

		expect(sent).toBe(true);
	});

	it('reuses one client across reports', async () => {
		const reportError = await loadReportError();

		await reportError(new Error('one'));
		await reportError(new Error('two'));

		expect(PostHog).toHaveBeenCalledTimes(1);
	});

	it('sends nothing when reporting is off', async () => {
		const reportError = await loadReportError();
		vi.mocked(getReportingToken).mockReturnValueOnce(undefined);

		await reportError(new Error('boom'));

		expect(PostHog).not.toHaveBeenCalled();
		expect(captureExceptionImmediate).not.toHaveBeenCalled();
	});

	it('never throws when the send rejects', async () => {
		const reportError = await loadReportError();
		captureExceptionImmediate.mockRejectedValueOnce(new Error('offline'));

		await expect(reportError(new Error('boom'))).resolves.toBeUndefined();
	});
});
