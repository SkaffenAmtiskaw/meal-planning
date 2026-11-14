import { beforeEach, describe, expect, it, vi } from 'vitest';

import posthog from 'posthog-js';

import { getReportingToken } from '@/_utils/errorReporting';
import { stripUrlQueries } from '@/_utils/stripUrlQueries';

vi.mock('posthog-js', async () => await import('#mocks/posthog-js'));
vi.mock('@/_utils/stripUrlQueries', () => ({ stripUrlQueries: vi.fn() }));
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

	it('removes the query strings from URLs in every event before it is sent', async () => {
		await import('./instrumentation-client');

		const { before_send } = vi.mocked(posthog.init).mock.calls[0][1] ?? {};

		expect(before_send).toBe(stripUrlQueries);
	});

	it('leaves posthog-js unstarted when reporting is off', async () => {
		vi.mocked(getReportingToken).mockReturnValueOnce(undefined);

		await import('./instrumentation-client');

		expect(posthog.init).not.toHaveBeenCalled();
	});
});
