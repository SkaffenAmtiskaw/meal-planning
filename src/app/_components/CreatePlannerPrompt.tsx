'use client';

import { useState } from 'react';

import { Alert, Button, Center, Stack, Typography } from '@mantine/core';

import { createUser } from '@/_actions';

type Props = {
	email: string;
};

export const CreatePlannerPrompt = ({ email }: Props) => {
	const [error, setError] = useState<string | null>(null);

	const handleClick = async () => {
		const result = await createUser(email);
		if (result?.error) setError(result.error);
	};

	return (
		<Center h="100vw" w="100vh">
			<Stack bg="var(--mantine-color-blue-light)" p={24} align="center">
				{/* TODO: Create global alert component with context */}
				{error && <Alert color="red">{error}</Alert>}
				<Typography>
					<p>It looks like you have not created a meal plan yet.</p>
				</Typography>
				<Button onClick={handleClick}>Get Started</Button>
			</Stack>
		</Center>
	);
};
