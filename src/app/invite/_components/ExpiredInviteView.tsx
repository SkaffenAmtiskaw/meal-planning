'use client';

import { useRouter } from 'next/navigation';
import type React from 'react';

import { Alert, Button, Stack, Text } from '@mantine/core';

interface ExpiredInviteViewProps {
	email: string;
}

export const ExpiredInviteView: React.FC<ExpiredInviteViewProps> = ({
	email,
}) => {
	const router = useRouter();

	const handleContinue = () => {
		router.push(`/?email=${encodeURIComponent(email)}`);
	};

	return (
		<Stack>
			<Alert color="yellow" data-testid="expired-alert">
				This invite has expired
			</Alert>

			<Text data-testid="expired-message">
				You can still create an account or sign in with {email}
			</Text>

			<Button
				variant="cta"
				data-testid="continue-button"
				onClick={handleContinue}
			>
				Continue to Sign In
			</Button>
		</Stack>
	);
};
