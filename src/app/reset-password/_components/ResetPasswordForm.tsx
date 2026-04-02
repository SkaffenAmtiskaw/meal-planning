'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert, Anchor, Button, PasswordInput, Stack } from '@mantine/core';

import { client } from '@/_utils/auth';

type Props = {
	token: string;
};

export const ResetPasswordForm = ({ token }: Props) => {
	const router = useRouter();
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async () => {
		setError(null);

		if (newPassword !== confirmPassword) {
			setError('Passwords do not match.');
			return;
		}

		const result = await client.resetPassword({ token, newPassword });

		if (result.error) {
			setError(
				result.error.message ??
					'Could not reset password. The link may have expired.',
			);
		} else {
			router.push('/');
		}
	};

	return (
		<Stack>
			<PasswordInput
				data-testid="new-password-input"
				label="New password"
				placeholder="At least 8 characters"
				value={newPassword}
				onChange={(e) => setNewPassword(e.currentTarget.value)}
			/>
			<PasswordInput
				data-testid="confirm-password-input"
				label="Confirm new password"
				placeholder="Re-enter your new password"
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.currentTarget.value)}
			/>
			{error && (
				<Alert color="red" data-testid="error-alert">
					{error}{' '}
					<Anchor href="/" data-testid="back-to-sign-in-link">
						Request a new link.
					</Anchor>
				</Alert>
			)}
			<Button data-testid="reset-password-button" onClick={handleSubmit}>
				Reset password
			</Button>
		</Stack>
	);
};
