'use client';

import { useEffect } from 'react';

import posthog from 'posthog-js';

import { ErrorMessage } from '@/app/_components/ErrorMessage';

export default function PlannerError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	// An error a boundary catches never reaches posthog-js's global handler
	useEffect(() => {
		posthog.captureException(error);
	}, [error]);

	return <ErrorMessage reset={reset} />;
}
