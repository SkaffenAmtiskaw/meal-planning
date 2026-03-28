import { Center, Stack, Typography } from '@mantine/core';

import { SignIn } from '@/_components';

export const SignInPrompt = () => {
	return (
		<Center h="100%" w="100%">
			<Stack bg="var(--mantine-color-blue-light)" p={24} align="center">
				<Typography>
					<p>In order to use the meal planner, you must sign in.</p>
				</Typography>
				<SignIn />
			</Stack>
		</Center>
	);
};
