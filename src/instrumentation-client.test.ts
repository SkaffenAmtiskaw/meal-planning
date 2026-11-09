import { beforeEach, describe, expect, it, vi } from 'vitest';

import posthog from 'posthog-js';

import { getReportingToken } from '@/_utils/errorReporting';

vi.mock('posthog-js', async () => await import('#mocks/posthog-js'));
vi.mock('@/_utils/errorReporting', () => ({
	getReportingToken: vi.fn(() => 'phc_token'),
	POSTHOG_UI_HOST: 'https://ui.example.com',
	RELAY_PATH: '/relay',
}));

describe('instrumentation-client', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	it('starts posthog-js through the relay when reporting is on', async () => {
		await import('./instrumentation-client');

		expect(posthog.init).toHaveBeenCalledWith(
			'phc_token',
			expect.objectContaining({
				api_host: '/relay',
				ui_host: 'https://ui.example.com',
				capture_exceptions: true,
			}),
		);
	});

	it('leaves posthog-js unstarted when reporting is off', async () => {
		vi.mocked(getReportingToken).mockReturnValueOnce(undefined);

		await import('./instrumentation-client');

		expect(posthog.init).not.toHaveBeenCalled();
	});
});
