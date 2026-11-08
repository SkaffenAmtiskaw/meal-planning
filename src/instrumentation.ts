import { createOnRequestError } from '@posthog/next';

import mongoose from 'mongoose';

import {
	getReportingToken,
	isReportingOn,
	POSTHOG_HOST,
} from '@/_utils/errorReporting';

import { env } from './env';

export const register = () => {
	mongoose.connect(env.DB_URL);
};

export const onRequestError = createOnRequestError({
	// @posthog/next otherwise reads NEXT_PUBLIC_POSTHOG_KEY, a different name from the token's
	apiKey: getReportingToken(),
	host: POSTHOG_HOST,
	beforeCapture: () => (isReportingOn() ? undefined : false),
});
