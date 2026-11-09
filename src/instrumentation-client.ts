import posthog from 'posthog-js';

import {
	getReportingToken,
	POSTHOG_UI_HOST,
	RELAY_PATH,
} from '@/_utils/errorReporting';

const token = getReportingToken();

if (token) {
	posthog.init(token, {
		api_host: RELAY_PATH,
		ui_host: POSTHOG_UI_HOST,
		capture_exceptions: true,
		// Exceptions only: analytics is out of scope for error reporting
		person_profiles: 'never',
		capture_pageview: false,
		capture_pageleave: false,
		autocapture: false,
		rageclick: false,
		capture_dead_clicks: false,
		capture_heatmaps: false,
		capture_performance: false,
		disable_session_recording: true,
		disable_surveys: true,
	});
}
