'use client';

import { useState } from 'react';

import {
	Alert,
	Button,
	Divider,
	PasswordInput,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { IconBrandGoogleFilled } from '@tabler/icons-react';

import { checkEmailStatus } from '@/_actions/auth';
import { client } from '@/_utils/auth';

type Step =
	| { type: 'idle' }
	| { type: 'new'; email: string }
	| { type: 'has-password'; email: string }
	| { type: 'social-only'; email: string }
	| { type: 'email-sent'; email: string };

export const SignIn = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [step, setStep] = useState<Step>({ type: 'idle' });
	const [error, setError] = useState<string | null>(null);

	const signInWithGoogle = async () =>
		await client.signIn.social({ provider: 'google' });

	const handleContinue = async () => {
		setError(null);
		const status = await checkEmailStatus(email);
		setStep({ type: status, email });
	};

	const handleSignIn = async () => {
		setError(null);
		const result = await client.signIn.email({
			email,
			password,
			callbackURL: '/',
		});
		if (result.error) {
			setError(result.error.message ?? 'Invalid password. Please try again.');
		}
	};

	const handleSignUp = async () => {
		setError(null);
		const result = await client.signUp.email({
			email,
			password,
			name: email,
			callbackURL: '/verify-email',
		});
		if (result.error) {
			setError(
				result.error.message ?? 'Could not create account. Please try again.',
			);
		} else {
			setStep({ type: 'email-sent', email });
		}
	};

	const resetToIdle = () => {
		setStep({ type: 'idle' });
		setPassword('');
		setError(null);
	};

	return (
		<Stack>
			<Button
				data-testid="google-sign-in-button"
				leftSection={<IconBrandGoogleFilled />}
				onClick={signInWithGoogle}
			>
				Sign In with Google
			</Button>

			<Divider label="or sign in with email" />

			{step.type === 'idle' && (
				<>
					<TextInput
						data-testid="email-input"
						type="email"
						label="Email"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.currentTarget.value)}
					/>
					<Button data-testid="continue-button" onClick={handleContinue}>
						Continue
					</Button>
				</>
			)}

			{step.type === 'has-password' && (
				<>
					<Text size="sm" data-testid="email-display">
						{step.email}
					</Text>
					<Button
						variant="subtle"
						size="xs"
						onClick={resetToIdle}
						data-testid="change-email-button"
					>
						Change email
					</Button>
					<PasswordInput
						data-testid="password-input"
						label="Password"
						placeholder="Your password"
						value={password}
						onChange={(e) => setPassword(e.currentTarget.value)}
					/>
					{error && (
						<Alert color="red" data-testid="error-alert">
							{error}
						</Alert>
					)}
					<Button data-testid="sign-in-button" onClick={handleSignIn}>
						Sign In
					</Button>
				</>
			)}

			{step.type === 'new' && (
				<>
					<Text size="sm" data-testid="email-display">
						{step.email}
					</Text>
					<Button
						variant="subtle"
						size="xs"
						onClick={resetToIdle}
						data-testid="change-email-button"
					>
						Change email
					</Button>
					<PasswordInput
						data-testid="password-input"
						label="Create a password"
						placeholder="At least 8 characters"
						value={password}
						onChange={(e) => setPassword(e.currentTarget.value)}
					/>
					{error && (
						<Alert color="red" data-testid="error-alert">
							{error}
						</Alert>
					)}
					<Button data-testid="sign-up-button" onClick={handleSignUp}>
						Create Account
					</Button>
				</>
			)}

			{step.type === 'social-only' && (
				<>
					<Button
						variant="subtle"
						size="xs"
						onClick={resetToIdle}
						data-testid="change-email-button"
					>
						Change email
					</Button>
					<Alert color="yellow" data-testid="social-only-alert">
						This email is linked to a Google account. Use Google sign-in or
						reset your password.
					</Alert>
				</>
			)}

			{step.type === 'email-sent' && (
				<Alert color="green" data-testid="email-sent-alert">
					Check your inbox — we sent a verification link to {step.email}.
				</Alert>
			)}
		</Stack>
	);
};
