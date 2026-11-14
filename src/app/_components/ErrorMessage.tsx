'use client';

import { Button, Center, Stack, Text, Title } from '@mantine/core';

/** The message an error boundary shows, with a button that re-renders its segment. */
export const ErrorMessage = ({ reset }: { reset: () => void }) => (
	<Center h="100vh">
		<Stack align="center">
			<Title order={2}>Something went wrong</Title>
			<Text>An unexpected error occurred. Please try again.</Text>
			<Button onClick={reset}>Try again</Button>
		</Stack>
	</Center>
);
