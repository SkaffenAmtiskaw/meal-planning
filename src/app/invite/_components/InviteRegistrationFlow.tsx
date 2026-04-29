'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PasswordInput, Stack, TextInput } from '@mantine/core';

import { signUpWithInvite } from '@/_actions/planner/signUpWithInvite';
import { useAsyncButton } from '@/_hooks';
import { zSafeString } from '@/_utils/zSafeString';

import {
	AuthLayoutAlert,
	AuthLayoutEmailDisplay,
	AuthLayoutFormSection,
	AuthLayoutSubmitButton,
} from '../../_components/AuthLayout';

export interface InviteRegistrationFlowProps {
	email: string;
	token: string;
}

export const InviteRegistrationFlow: React.FC<InviteRegistrationFlowProps> = ({
	email,
	token,
}) => {
	const router = useRouter();
	const { loading, error, run } = useAsyncButton();
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [validationError, setValidationError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setValidationError(null);

		// Validate password
		if (password.length < 8) {
			setValidationError('Password must be at least 8 characters');
			return;
		}

		// Validate name if provided
		const nameToUse = name.trim() || 'New User';
		if (name.trim()) {
			const nameValidation = zSafeString().safeParse(name.trim());
			if (!nameValidation.success) {
				const message = nameValidation.error?.issues?.[0]?.message;
				setValidationError(`Name ${message || 'is invalid'}`);
				return;
			}
		}

		await run(async () => {
			const result = await signUpWithInvite({
				token,
				password,
				name: nameToUse,
			});

			if (!result.success) {
				throw new Error(result.error || 'Registration failed');
			}

			// Redirect on success
			if (result.redirectUrl) {
				router.push(result.redirectUrl);
			}
		});
	};

	const displayError = validationError || error;

	return (
		<AuthLayoutFormSection>
			<Stack component="form" onSubmit={handleSubmit} gap="md">
				<AuthLayoutEmailDisplay email={email} />

				<TextInput
					label="Name"
					placeholder="New User"
					value={name}
					onChange={(e) => setName(e.target.value)}
					data-testid="input-Name"
					w="100%"
				/>

				<PasswordInput
					label="Create a password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					data-testid="input-Create a password"
					w="100%"
				/>

				{displayError && <AuthLayoutAlert>{displayError}</AuthLayoutAlert>}

				<AuthLayoutSubmitButton loading={loading}>
					Create Account
				</AuthLayoutSubmitButton>
			</Stack>
		</AuthLayoutFormSection>
	);
};
