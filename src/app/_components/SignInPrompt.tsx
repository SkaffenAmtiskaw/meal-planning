import { Text } from '@mantine/core';

import { AuthCard, SignIn } from '@/_components';

export const SignInPrompt = () => {
	return (
		<AuthCard>
			<Text ta="center">
				In order to use the meal planner, you must sign in.
			</Text>
			<SignIn />
		</AuthCard>
	);
};
