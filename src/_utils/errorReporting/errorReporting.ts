import { env } from '@/env';

/**
 * Reporting is on only in Vercel's Production environment with the project token set, so local dev,
 * previews, CI and tests send nothing, even if a token reaches `.env.local`.
 */
export const isReportingOn = () =>
	env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
	Boolean(env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

/** The PostHog project token when reporting is on, otherwise undefined. */
export const getReportingToken = () =>
	isReportingOn() ? env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN : undefined;
