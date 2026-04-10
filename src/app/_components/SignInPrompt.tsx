import { Box, Image, Stack, Text } from '@mantine/core';

import { SignIn } from '@/_components';

export const SignInPrompt = () => {
	return (
		<Box
			style={{
				minHeight: '100vh',
				backgroundColor: '#1C3144',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Stack
				bg="#EFE7E9"
				p={32}
				align="center"
				style={{
					borderRadius: 12,
					maxWidth: 400,
					width: '90%',
				}}
			>
				<Image
					src="/weeknight-login.svg"
					alt="weeknight"
					w={200}
					h={50}
					fit="contain"
				/>
				<Text c="#1C3144" ta="center">
					In order to use the meal planner, you must sign in.
				</Text>
				<SignIn />
			</Stack>
		</Box>
	);
};
