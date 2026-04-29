import type { ReactNode } from 'react';

import { Box, Center, Image, Stack } from '@mantine/core';

export interface AuthLayoutRootProps {
	children: ReactNode;
}

export const AuthLayoutRoot: React.FC<AuthLayoutRootProps> = ({ children }) => {
	return (
		<Box bg="navy.5" style={{ minHeight: '100vh' }}>
			<Center h="100vh" p="md">
				<Stack
					bg="chalk.5"
					p="xl"
					align="center"
					style={{
						borderRadius: 'var(--mantine-radius-md)',
						maxWidth: 400,
						width: '100%',
					}}
				>
					<Image
						src="/weeknight-login.svg"
						alt="weeknight"
						w={200}
						h={50}
						fit="contain"
					/>
					{children}
				</Stack>
			</Center>
		</Box>
	);
};
