'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button, PasswordInput, TextInput } from '@mantine/core';

import { checkEmailStatus } from '@/_actions/auth';
import { GoogleLogoSVG } from '@/_components/GoogleLogoSVG';
import { useAsyncButton } from '@/_hooks';
import { client } from '@/_utils/auth';
import { zSafeString } from '@/_utils/zSafeString';

import {
	AuthLayoutAlert,
	AuthLayoutDivider,
	AuthLayoutEmailDisplay,
	AuthLayoutFooter,
	AuthLayoutFormSection,
	AuthLayoutSocialSection,
	AuthLayoutSubmitButton,
} from './AuthLayout';
import './GoogleButton.css';

/**
 * TODO: Break up SignInFlow into multiple components
 *
 * Current issues:
 * - Component is 350+ lines with complex state management
 * - useEffect has object (continueBtn) in dependency array causing unnecessary re-runs
 * - Multiple step types (idle, new, has-password, social-only, email-sent, forgot-password-sent)
 *   could each be their own component
 *
 * Proposed structure:
 * - SignInFlow: Orchestration component with shared state
 * - IdleStep: Initial email entry with Google sign-in
 * - HasPasswordStep: Password entry for existing accounts
 * - NewAccountStep: Registration form
 * - SocialOnlyStep: Google-only account warning
 * - SuccessStep: Email sent confirmation
 * - ForgotPasswordStep: Password reset flow
 *
 * This would improve:
 * - Testability (each step tested independently)
 * - Maintainability (smaller, focused components)
 * - Performance (no unnecessary effect re-runs)
 */

// No props needed - component is self-contained

export type Step =
	| { type: 'idle' }
	| { type: 'new'; email: string }
	| { type: 'has-password'; email: string }
	| { type: 'social-only'; email: string }
	| { type: 'email-sent'; email: string }
	| { type: 'forgot-password-sent'; email: string };

export const SignInFlow: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [step, setStep] = useState<Step>({ type: 'idle' });
	const [signupError, setSignupError] = useState<string | null>(null);

	const continueBtn = useAsyncButton();
	const googleBtn = useAsyncButton();
	const signInBtn = useAsyncButton();
	const signUpBtn = useAsyncButton();
	const forgotPasswordBtn = useAsyncButton();

	const searchParams = useSearchParams();
	const emailFromQuery = searchParams.get('email');

	// Auto-trigger email check when email is provided in query params
	useEffect(() => {
		if (emailFromQuery && step.type === 'idle') {
			setEmail(emailFromQuery);
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

	const handleForgotPassword = (emailToReset: string) =>
		forgotPasswordBtn.run(async () => {
			const result = await client.requestPasswordReset({
				email: emailToReset,
				redirectTo: '/reset-password',
			});
			if (result.error) {
				throw new Error(
					result.error.message ??
						'Could not send reset email. Please try again.',
				);
			}
			setStep({ type: 'forgot-password-sent', email: emailToReset });
		});

	const resetToIdle = () => {
		setStep({ type: 'idle' });
		setPassword('');
		setName('');
		setSignupError(null);
	};

	// Render different content based on step
	const renderContent = () => {
		switch (step.type) {
			case 'idle':
				return (
					<>
						<AuthLayoutSocialSection>
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
						</AuthLayoutSocialSection>

						<AuthLayoutDivider label="or sign in with email" />

						<AuthLayoutFormSection>
							<TextInput
								data-testid="email-input"
								type="email"
								label="Email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.currentTarget.value)}
								w="100%"
							/>
							{continueBtn.error && (
								<AuthLayoutAlert color="red" data-testid="continue-error-alert">
									{continueBtn.error}
								</AuthLayoutAlert>
							)}
							<AuthLayoutSubmitButton
								data-testid="continue-button"
								loading={continueBtn.loading}
								onClick={handleContinue}
								type="button"
							>
								Continue
							</AuthLayoutSubmitButton>
						</AuthLayoutFormSection>
					</>
				);

			case 'has-password':
				return (
					<>
						<AuthLayoutEmailDisplay
							email={step.email}
							onChangeEmail={resetToIdle}
							data-testid="email-display"
						/>
						<AuthLayoutFormSection>
							<PasswordInput
								data-testid="password-input"
								label="Password"
								placeholder="Your password"
								value={password}
								onChange={(e) => setPassword(e.currentTarget.value)}
								w="100%"
							/>
							{signInBtn.error && (
								<AuthLayoutAlert color="red" data-testid="signin-error-alert">
									{signInBtn.error}
								</AuthLayoutAlert>
							)}
							<AuthLayoutSubmitButton
								data-testid="sign-in-button"
								loading={signInBtn.loading}
								onClick={handleSignIn}
								type="button"
							>
								Sign In
							</AuthLayoutSubmitButton>
						</AuthLayoutFormSection>

						<AuthLayoutFooter>
							{forgotPasswordBtn.error && (
								<AuthLayoutAlert
									color="red"
									data-testid="forgot-password-error-alert"
								>
									{forgotPasswordBtn.error}
								</AuthLayoutAlert>
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
						</AuthLayoutFooter>
					</>
				);

			case 'new': {
				// Define handleSignUp inside the case block so TypeScript can narrow step type
				const handleSignUp = () =>
					signUpBtn.run(async () => {
						setSignupError(null);

						const trimmedName = name.trim();
						if (trimmedName) {
							const parsed = zSafeString().safeParse(trimmedName);
							if (!parsed.success) {
								throw new Error(parsed.error.issues[0].message);
							}
						}

						if (password.length < 8) {
							throw new Error('Password must be at least 8 characters');
						}

						// TypeScript narrows step type here because we're inside case 'new'
						const currentEmail = step.email;
						const result = await client.signUp.email({
							email: currentEmail,
							password,
							name: trimmedName || 'New User',
							callbackURL: '/verify-email',
						});
						if (result.error) {
							throw new Error(
								result.error.message ??
									'Could not create account. Please try again.',
							);
						}
						setStep({ type: 'email-sent', email: currentEmail });
					});

				return (
					<>
						<AuthLayoutEmailDisplay
							email={step.email}
							onChangeEmail={resetToIdle}
							data-testid="email-display"
						/>
						<AuthLayoutFormSection>
							<TextInput
								data-testid="name-input"
								label="Name (optional)"
								placeholder="New User"
								value={name}
								onChange={(e) => setName(e.currentTarget.value)}
								w="100%"
							/>
							<PasswordInput
								data-testid="create-password-input"
								label="Create a password"
								placeholder="At least 8 characters"
								value={password}
								onChange={(e) => setPassword(e.currentTarget.value)}
								w="100%"
							/>
							{(signupError || signUpBtn.error) && (
								<AuthLayoutAlert color="red" data-testid="signup-error-alert">
									{signupError || signUpBtn.error}
								</AuthLayoutAlert>
							)}
							<AuthLayoutSubmitButton
								data-testid="create-account-button"
								loading={signUpBtn.loading}
								onClick={handleSignUp}
								type="button"
							>
								Create Account
							</AuthLayoutSubmitButton>
						</AuthLayoutFormSection>
					</>
				);
			}

			case 'social-only':
				return (
					<>
						<AuthLayoutFooter>
							<Button
								variant="subtle"
								size="xs"
								data-testid="change-email-button"
								onClick={resetToIdle}
							>
								Change email
							</Button>
						</AuthLayoutFooter>

						<AuthLayoutAlert color="yellow" data-testid="social-only-alert">
							This email is linked to a Google account. Use Google sign-in or
							reset your password.
						</AuthLayoutAlert>

						<AuthLayoutFooter>
							{forgotPasswordBtn.error && (
								<AuthLayoutAlert
									color="red"
									data-testid="forgot-password-error-alert"
								>
									{forgotPasswordBtn.error}
								</AuthLayoutAlert>
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
						</AuthLayoutFooter>
					</>
				);

			case 'email-sent':
				return (
					<AuthLayoutAlert color="green" data-testid="email-sent-alert">
						Check your inbox — we sent a verification link to {step.email}.
					</AuthLayoutAlert>
				);

			case 'forgot-password-sent':
				return (
					<AuthLayoutAlert
						color="green"
						data-testid="forgot-password-sent-alert"
					>
						Check your inbox — we sent a password reset link to {step.email}.
					</AuthLayoutAlert>
				);

			default:
				return null;
		}
	};

	return <>{renderContent()}</>;
};
