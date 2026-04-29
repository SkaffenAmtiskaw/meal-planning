'use client';

import type { ReactNode } from 'react';

import { Box, Center, Image, Stack, useMantineTheme } from '@mantine/core';

interface AuthCardProps {
	children: ReactNode;
}

export const AuthCard = ({ children }: AuthCardProps) => {
	const theme = useMantineTheme();

	return (
		<Box bg={theme.colors.navy[5]} style={{ minHeight: '100vh' }}>
			<Center h="100vh" p="md">
				<Stack
					bg={theme.colors.chalk[5]}
					p="xl"
					align="center"
					style={{
						borderRadius: theme.radius.md,
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
