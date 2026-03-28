'use client';

import { Button, Center, Stack, Typography } from '@mantine/core';

import { createUser } from '@/_actions';

type Props = {
	email: string;
};

export const CreatePlannerPrompt = ({ email }: Props) => {
	return (
		<Center h="100vw" w="100vh">
			<Stack bg="var(--mantine-color-blue-light)" p={24} align="center">
				<Typography>
					<p>It looks like you have not created a meal plan yet.</p>
				</Typography>
				<Button onClick={() => createUser(email)}>Get Started</Button>
			</Stack>
		</Center>
	);
};
