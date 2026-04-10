"use client";

import {
	Alert,
	Button,
	Divider,
	PasswordInput,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { useState } from "react";

import { checkEmailStatus } from "@/_actions/auth";
import { useAsyncButton } from "@/_hooks";
import { client } from "@/_utils/auth";
import { zSafeString } from "@/_utils/zSafeString";

type Step =
	| { type: "idle" }
	| { type: "new"; email: string }
	| { type: "has-password"; email: string }
	| { type: "social-only"; email: string }
	| { type: "email-sent"; email: string }
	| { type: "forgot-password-sent"; email: string };

export const SignIn = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [step, setStep] = useState<Step>({ type: "idle" });
	const continueBtn = useAsyncButton();
	const googleBtn = useAsyncButton();
	const signInBtn = useAsyncButton();
	const signUpBtn = useAsyncButton();
	const forgotPasswordBtn = useAsyncButton();

	const signInWithGoogle = () =>
		googleBtn.run(async () => {
			await client.signIn.social({ provider: "google" });
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
				callbackURL: "/",
			});
			if (result.error) {
				throw new Error(
					result.error.message ?? "Invalid password. Please try again.",
				);
			}
		});

	const handleSignUp = () =>
		signUpBtn.run(async () => {
			const trimmedName = name.trim();
			if (trimmedName) {
				const parsed = zSafeString().safeParse(trimmedName);
				if (!parsed.success) {
					throw new Error(parsed.error.issues[0].message);
				}
			}
			const result = await client.signUp.email({
				email,
				password,
				name: trimmedName || "New User",
				callbackURL: "/verify-email",
			});
			if (result.error) {
				throw new Error(
					result.error.message ?? "Could not create account. Please try again.",
				);
			}
			setStep({ type: "email-sent", email });
		});

	const handleForgotPassword = (email: string) =>
		forgotPasswordBtn.run(async () => {
			const result = await client.requestPasswordReset({
				email,
				redirectTo: "/reset-password",
			});
			if (result.error) {
				throw new Error(
					result.error.message ??
						"Could not send reset email. Please try again.",
				);
			}
			setStep({ type: "forgot-password-sent", email });
		});

	const resetToIdle = () => {
		setStep({ type: "idle" });
		setPassword("");
		setName("");
	};

	return (
		<Stack>
			<Button
				color="ember"
				data-testid="google-sign-in-button"
				leftSection={<IconBrandGoogleFilled />}
				loading={googleBtn.loading}
				onClick={signInWithGoogle}
			>
				Sign In with Google
			</Button>

			<Divider label="or sign in with email" />

			{step.type === "idle" && (
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

			{step.type === "has-password" && (
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
					{signInBtn.error && (
						<Alert color="red" data-testid="error-alert">
							{signInBtn.error}
						</Alert>
					)}
					<Button
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

			{step.type === "new" && (
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
					<TextInput
						data-testid="name-input"
						label="User Name"
						placeholder="New User"
						value={name}
						onChange={(e) => setName(e.currentTarget.value)}
					/>
					<PasswordInput
						data-testid="password-input"
						label="Create a password"
						placeholder="At least 8 characters"
						value={password}
						onChange={(e) => setPassword(e.currentTarget.value)}
					/>
					{signUpBtn.error && (
						<Alert color="red" data-testid="error-alert">
							{signUpBtn.error}
						</Alert>
					)}
					<Button
						data-testid="sign-up-button"
						loading={signUpBtn.loading}
						onClick={handleSignUp}
					>
						Create Account
					</Button>
				</>
			)}

			{step.type === "social-only" && (
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

			{step.type === "email-sent" && (
				<Alert color="green" data-testid="email-sent-alert">
					Check your inbox — we sent a verification link to {step.email}.
				</Alert>
			)}

			{step.type === "forgot-password-sent" && (
				<Alert color="green" data-testid="forgot-password-sent-alert">
					Check your inbox — we sent a password reset link to {step.email}.
				</Alert>
			)}
		</Stack>
	);
};
