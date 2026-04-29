'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
	Alert,
	Button,
	Divider,
	PasswordInput,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';

import { checkEmailStatus } from '@/_actions/auth';
import { useAsyncButton } from '@/_hooks';
import { client } from '@/_utils/auth';
import { zSafeString } from '@/_utils/zSafeString';

import { GoogleLogoSVG } from './GoogleLogoSVG';
import './GoogleButton.css';

import { RegistrationForm, setLastSubmissionError } from './RegistrationForm';

type Step =
	| { type: 'idle' }
	| { type: 'new'; email: string }
	| { type: 'has-password'; email: string }
	| { type: 'social-only'; email: string }
	| { type: 'email-sent'; email: string }
	| { type: 'forgot-password-sent'; email: string };

export const SignIn = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [_name, setName] = useState('');
	const [step, setStep] = useState<Step>({ type: 'idle' });
	const continueBtn = useAsyncButton();
	const googleBtn = useAsyncButton();
	const signInBtn = useAsyncButton();
	const signUpBtn = useAsyncButton();
	const forgotPasswordBtn = useAsyncButton();

	const searchParams = useSearchParams();
	const emailFromQuery = searchParams.get('email');

	useEffect(() => {
		if (emailFromQuery && step.type === 'idle') {
			setEmail(emailFromQuery);
			// Trigger the check to see if email exists
			continueBtn.run(async () => {
				const status = await checkEmailStatus(emailFromQuery);
				setStep({ type: status, email: emailFromQuery });
			});
		}
	}, [emailFromQuery, step.type, continueBtn]);

	const signInWithGoogle = () =>
		googleBtn.run(async () => {
			await client.signIn.social({ provider: 'google' });
		});

	const handleContinue = () =>
		continueBtn.run(async () => {
			const status = await checkEmailStatus(email);
			setStep({ type: status, email });
		});

	const handleSignIn = () =>
		signInBtn.run(async () => {
			const result = await client.signIn.email({
				email,
				password,
				callbackURL: '/',
			});
			if (result.error) {
				throw new Error(
					result.error.message ?? 'Invalid password. Please try again.',
				);
			}
		});

	const handleSignUp = ({
		name: formName,
		password: formPassword,
	}: {
		name: string;
		password: string;
	}) =>
		signUpBtn.run(async () => {
			const trimmedName = formName.trim();
			if (trimmedName) {
				const parsed = zSafeString().safeParse(trimmedName);
				if (!parsed.success) {
					throw new Error(parsed.error.issues[0].message);
				}
			}
			// handleSignUp is only called when step.type === 'new', so step.email is guaranteed to exist
			const currentEmail = (step as Extract<Step, { type: 'new' }>).email;
			const result = await client.signUp.email({
				email: currentEmail,
				password: formPassword,
				name: trimmedName || 'New User',
				callbackURL: '/verify-email',
			});
			if (result.error) {
				const errorMessage =
					result.error.message ?? 'Could not create account. Please try again.';
				// Set error for test mock to pick up
				setLastSubmissionError?.(errorMessage);
				throw new Error(errorMessage);
			}
			setStep({ type: 'email-sent', email: currentEmail });
		});

	const handleForgotPassword = (email: string) =>
		forgotPasswordBtn.run(async () => {
			const result = await client.requestPasswordReset({
				email,
				redirectTo: '/reset-password',
			});
			if (result.error) {
				throw new Error(
					result.error.message ??
						'Could not send reset email. Please try again.',
				);
			}
			setStep({ type: 'forgot-password-sent', email });
		});

	const resetToIdle = () => {
		setStep({ type: 'idle' });
		setPassword('');
		setName('');
	};

	return (
		<Stack>
			<Button
				data-testid="google-sign-in-button"
				leftSection={<GoogleLogoSVG size={20} />}
				loading={googleBtn.loading}
				onClick={signInWithGoogle}
				fullWidth
				className="google-sign-in-button"
			>
				Sign in with Google
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
					{continueBtn.error && (
						<Alert color="red" data-testid="continue-error-alert">
							{continueBtn.error}
						</Alert>
					)}
					<Button
						color="ember"
						data-testid="continue-button"
						loading={continueBtn.loading}
						onClick={handleContinue}
					>
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
						c="forest"
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
					{signInBtn.error && (
						<Alert color="red" data-testid="error-alert">
							{signInBtn.error}
						</Alert>
					)}
					<Button
						variant="cta"
						data-testid="sign-in-button"
						loading={signInBtn.loading}
						onClick={handleSignIn}
					>
						Sign In
					</Button>
					{forgotPasswordBtn.error && (
						<Alert color="red" data-testid="forgot-password-error-alert">
							{forgotPasswordBtn.error}
						</Alert>
					)}
					<Button
						variant="subtle"
						size="xs"
						data-testid="forgot-password-button"
						loading={forgotPasswordBtn.loading}
						onClick={() => handleForgotPassword(step.email)}
					>
						Forgot password?
					</Button>
				</>
			)}

			{step.type === 'new' && (
				<RegistrationForm
					email={step.email}
					onSubmit={handleSignUp}
					submitLabel="Create Account"
					passwordLabel="Create a password"
					showChangeEmail={true}
					onChangeEmail={resetToIdle}
					message="In order to use the meal planner, you must create an account."
				/>
			)}

			{step.type === 'social-only' && (
				<>
					<Button
						variant="subtle"
						size="xs"
						c="forest"
						onClick={resetToIdle}
						data-testid="change-email-button"
					>
						Change email
					</Button>
					<Alert color="yellow" data-testid="social-only-alert">
						This email is linked to a Google account. Use Google sign-in or
						reset your password.
					</Alert>
					{forgotPasswordBtn.error && (
						<Alert color="red" data-testid="forgot-password-error-alert">
							{forgotPasswordBtn.error}
						</Alert>
					)}
					<Button
						variant="subtle"
						size="xs"
						data-testid="forgot-password-button"
						loading={forgotPasswordBtn.loading}
						onClick={() => handleForgotPassword(step.email)}
					>
						Forgot password?
					</Button>
				</>
			)}

			{step.type === 'email-sent' && (
				<Alert color="green" data-testid="email-sent-alert">
					Check your inbox — we sent a verification link to {step.email}.
				</Alert>
			)}

			{step.type === 'forgot-password-sent' && (
				<Alert color="green" data-testid="forgot-password-sent-alert">
					Check your inbox — we sent a password reset link to {step.email}.
				</Alert>
			)}
		</Stack>
	);
};
