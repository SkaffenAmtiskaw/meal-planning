'use client';

import { useState } from 'react';

import {
	Alert,
	Button,
	PasswordInput,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';

import { useAsyncButton } from '@/_hooks';
import { zSafeString } from '@/_utils/zSafeString';

// Used for testing to communicate errors back to the test mock
let lastSubmissionError: string | null = null;
export const setLastSubmissionError = (error: string | null) => {
	lastSubmissionError = error;
};
export const getLastSubmissionError = () => lastSubmissionError;

interface RegistrationFormProps {
	email: string;
	onSubmit: (data: { name: string; password: string }) => Promise<void>;
	submitLabel: string;
	passwordLabel: string;
	showChangeEmail?: boolean;
	onChangeEmail?: () => void;
	message?: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
	email,
	onSubmit,
	submitLabel,
	passwordLabel,
	showChangeEmail,
	onChangeEmail,
	message,
}) => {
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const submitBtn = useAsyncButton();

	const handleSubmit = () =>
		submitBtn.run(async () => {
			const trimmedName = name.trim();

			// Validate name if provided
			if (trimmedName) {
				const parsed = zSafeString().safeParse(trimmedName);
				if (!parsed.success) {
					throw new Error(parsed.error.issues[0].message);
				}
			}

			// Validate password (at least 8 characters - Better Auth's default)
			if (password.length < 8) {
				throw new Error('Password must be at least 8 characters');
			}

			await onSubmit({ name: trimmedName, password });
		});

	return (
		<Stack align="center">
			{message && <Text>{message}</Text>}

			<Text size="sm" data-testid="email-display">
				{email}
			</Text>

			{showChangeEmail && (
				<Button
					variant="subtle"
					size="xs"
					c="forest"
					onClick={onChangeEmail}
					data-testid="change-email-button"
				>
					Change email
				</Button>
			)}

			<TextInput
				data-testid="name-input"
				label="User Name"
				placeholder="New User"
				value={name}
				onChange={(e) => setName(e.currentTarget.value)}
			/>

			<PasswordInput
				data-testid="password-input"
				label={passwordLabel}
				placeholder="At least 8 characters"
				value={password}
				onChange={(e) => setPassword(e.currentTarget.value)}
			/>

			{submitBtn.error && (
				<Alert color="red" data-testid="error-alert">
					{submitBtn.error}
				</Alert>
			)}

			<Button
				variant="cta"
				data-testid="submit-button"
				loading={submitBtn.loading}
				onClick={handleSubmit}
				disabled={submitBtn.loading}
			>
				{submitLabel}
			</Button>
		</Stack>
	);
};
