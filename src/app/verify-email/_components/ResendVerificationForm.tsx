'use client';

import { useState } from 'react';

import { Alert, Button, Stack, TextInput } from '@mantine/core';

import { client } from '@/_utils/auth';

export const ResendVerificationForm = () => {
	const [email, setEmail] = useState('');
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleResend = async () => {
		setError(null);
		const result = await client.sendVerificationEmail({
			email,
			callbackURL: '/verify-email',
		});
		if (result.error) {
			setError(
				result.error.message ??
					'Could not resend verification email. Please try again.',
			);
		} else {
			setSent(true);
		}
	};

	if (sent) {
		return (
			<Alert color="green" data-testid="resend-success-alert">
				Verification email sent — check your inbox.
			</Alert>
		);
	}

	return (
		<Stack>
			<TextInput
				data-testid="resend-email-input"
				type="email"
				label="Email"
				placeholder="you@example.com"
				value={email}
				onChange={(e) => setEmail(e.currentTarget.value)}
			/>
			{error && (
				<Alert color="red" data-testid="resend-error-alert">
					{error}
				</Alert>
			)}
			<Button data-testid="resend-button" onClick={handleResend}>
				Resend verification email
			</Button>
		</Stack>
	);
};
