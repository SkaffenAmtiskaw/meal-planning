'use client';

import { Button, Center, Stack, Text, Title } from '@mantine/core';

export default function PlannerError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<Center h="100vh">
			<Stack align="center">
				<Title order={2}>Something went wrong</Title>
				<Text>An unexpected error occurred. Please try again.</Text>
				<Button onClick={reset}>Try again</Button>
			</Stack>
		</Center>
	);
}
