'use client';

import { useState } from 'react';

import { Alert, Button, PasswordInput, Stack } from '@mantine/core';

import { client } from '@/_utils/auth';

type Props = {
	email: string;
};

type State = { type: 'idle' } | { type: 'success' } | { type: 'forgot-sent' };

export const ChangePasswordForm = ({ email }: Props) => {
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [state, setState] = useState<State>({ type: 'idle' });

	const handleChangePassword = async () => {
		setError(null);

		if (newPassword !== confirmPassword) {
			setError('Passwords do not match.');
			return;
		}

		const result = await client.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions: false,
		});

		if (result.error) {
			setError(
				result.error.message ?? 'Could not update password. Please try again.',
			);
		} else {
			setState({ type: 'success' });
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
		}
	};

	const handleForgotPassword = async () => {
		setError(null);
		await client.requestPasswordReset({ email, redirectTo: '/reset-password' });
		setState({ type: 'forgot-sent' });
	};

	if (state.type === 'success') {
		return (
			<Alert color="green" data-testid="success-alert">
				Password updated successfully.
			</Alert>
		);
	}

	if (state.type === 'forgot-sent') {
		return (
			<Alert color="green" data-testid="forgot-sent-alert">
				Check your inbox — we sent a password reset link to {email}.
			</Alert>
		);
	}

	return (
		<Stack>
			<PasswordInput
				data-testid="current-password-input"
				label="Current password"
				placeholder="Your current password"
				value={currentPassword}
				onChange={(e) => setCurrentPassword(e.currentTarget.value)}
			/>
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
					{error}
				</Alert>
			)}
			<Button
				color="ember"
				data-testid="change-password-button"
				onClick={handleChangePassword}
			>
				Update password
			</Button>
			<Button
				variant="subtle"
				size="xs"
				data-testid="forgot-password-button"
				onClick={handleForgotPassword}
			>
				Forgot current password?
			</Button>
		</Stack>
	);
};
