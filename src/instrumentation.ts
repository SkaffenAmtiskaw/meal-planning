import { createOnRequestError } from '@posthog/next';

import { connectDatabase } from '@/_models/database/connectDatabase';
import {
	getReportingToken,
	isReportingOn,
	POSTHOG_HOST,
} from '@/_utils/errorReporting';

export const register = async () => {
	await connectDatabase();
};

export const onRequestError = createOnRequestError({
	// @posthog/next otherwise reads NEXT_PUBLIC_POSTHOG_KEY, a different name from the token's
	apiKey: getReportingToken(),
	host: POSTHOG_HOST,
	// Checked before the API key, so a request error where reporting is off doesn't warn about it
	disabled: !isReportingOn(),
});
