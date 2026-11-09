'use client';

import { useEffect } from 'react';

import { MantineProvider, mantineHtmlProps } from '@mantine/core';

import posthog from 'posthog-js';

import { theme } from '@/_theme';
import { ErrorMessage } from '@/app/_components/ErrorMessage';

import '@mantine/core/styles.css';

/** Replaces the root layout when it fails, so it renders its own document and Mantine provider. */
export default function GlobalError({
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

	return (
		<html lang="en" {...mantineHtmlProps}>
			<body>
				<MantineProvider defaultColorScheme="light" theme={theme}>
					<ErrorMessage reset={reset} />
				</MantineProvider>
			</body>
		</html>
	);
}
