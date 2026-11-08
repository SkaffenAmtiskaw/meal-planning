import 'server-only';

import { PostHog } from 'posthog-node';

import { getReportingToken, POSTHOG_HOST } from '@/_utils/errorReporting';

let client: PostHog | undefined;

/**
 * Sends a caught error to PostHog, and waits for the send, because Vercel can freeze the function
 * before a queued event goes out. Sends nothing when reporting is off, and never throws.
 *
 * It passes no distinct ID, so posthog-node gives the event a random one with
 * `$process_person_profile: false`, and no person profile is created.
 */
export const reportError = async (error: unknown) => {
	const token = getReportingToken();
	if (!token) {
		return;
	}

	try {
		client ??= new PostHog(token, { host: POSTHOG_HOST });
		await client.captureExceptionImmediate(error);
	} catch {
		// A failed send must not change the caller's result
	}
};
