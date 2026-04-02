'use client';

import { useState } from 'react';

import {
	Alert,
	Button,
	PasswordInput,
	Stack,
	Text,
	Title,
} from '@mantine/core';

import { verifyEmailChangeAndSetPassword } from '@/_actions/user';

import { SignInWithNewEmailButton } from './SignInWithNewEmailButton';

type Props = {
	token: string;
};

export const SetPasswordForm = ({ token }: Props) => {
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	if (success) {
		return (
			<Stack>
				<Title order={3} data-testid="success-title">
					Email updated
				</Title>
				<Text data-testid="success-message">Your email has been changed.</Text>
				<SignInWithNewEmailButton />
			</Stack>
		);
	}

	const handleSubmit = async () => {
		setError(null);

		if (password !== confirm) {
			setError('Passwords do not match.');
			return;
		}

		setLoading(true);
		const result = await verifyEmailChangeAndSetPassword(token, password);
		setLoading(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		setSuccess(true);
	};

	return (
		<Stack>
			<Text data-testid="set-password-message">
				To complete your email change, create a password for your account.
			</Text>
			<PasswordInput
				data-testid="password-input"
				label="New password"
				placeholder="At least 8 characters"
				value={password}
				onChange={(e) => setPassword(e.currentTarget.value)}
			/>
			<PasswordInput
				data-testid="confirm-password-input"
				label="Confirm password"
				placeholder="Re-enter your new password"
				value={confirm}
				onChange={(e) => setConfirm(e.currentTarget.value)}
			/>
			{error && (
				<Alert color="red" data-testid="error-alert">
					{error}
				</Alert>
			)}
			<Button
				loading={loading}
				data-testid="submit-button"
				onClick={handleSubmit}
			>
				Set password and confirm email
			</Button>
		</Stack>
	);
};
