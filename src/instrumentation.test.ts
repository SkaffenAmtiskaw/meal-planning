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
	if (!options) throw new Error('onRequestError was created without options');
	return options;
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

	it('is enabled when reporting is on', async () => {
		const { disabled } = await loadOptions();

		expect(disabled).toBe(false);
	});

	it('is disabled when reporting is off', async () => {
		vi.mocked(isReportingOn).mockReturnValueOnce(false);
		const { disabled } = await loadOptions();

		expect(disabled).toBe(true);
	});
});
