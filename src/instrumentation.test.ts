import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createOnRequestError } from '@posthog/next';

import { isReportingOn } from '@/_utils/errorReporting';

vi.mock('mongoose', () => ({ default: { connect: vi.fn() } }));
vi.mock('./env', async () => await import('#mocks/env'));
vi.mock('@posthog/next', () => ({ createOnRequestError: vi.fn() }));
vi.mock('@/_utils/errorReporting', () => ({
	getReportingToken: vi.fn(() => 'phc_token'),
	isReportingOn: vi.fn(() => true),
	POSTHOG_HOST: 'https://posthog.example.com',
}));

const loadOptions = async () => {
	await import('./instrumentation');
	const options = vi.mocked(createOnRequestError).mock.calls[0][0];
	if (!options?.beforeCapture) {
		throw new Error('onRequestError was created without beforeCapture');
	}
	return { ...options, beforeCapture: options.beforeCapture };
};

const captureContext = {
	error: new Error('boom'),
	request: {},
	context: {},
	properties: {},
};

describe('onRequestError', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	it('sends with the project token to the US Cloud host', async () => {
		const { apiKey, host } = await loadOptions();

		expect(apiKey).toBe('phc_token');
		expect(host).toBe('https://posthog.example.com');
	});

	it('captures when reporting is on', async () => {
		const { beforeCapture } = await loadOptions();

		expect(await beforeCapture(captureContext)).toBeUndefined();
	});

	it('skips the capture when reporting is off', async () => {
		const { beforeCapture } = await loadOptions();
		vi.mocked(isReportingOn).mockReturnValueOnce(false);

		expect(await beforeCapture(captureContext)).toBe(false);
	});
});
