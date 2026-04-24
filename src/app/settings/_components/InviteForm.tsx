'use client';

import { useEffect, useState } from 'react';

import { Alert, Button, Group, Stack, TextInput } from '@mantine/core';

import { FormFeedbackAlert } from '@/_components';

export type InviteStatus = 'idle' | 'loading' | 'success' | 'error';

export interface InviteFormProps {
	status: InviteStatus;
	error: string | null;
	onInvite: (email: string) => void;
}

export const InviteForm: React.FC<InviteFormProps> = ({
	status,
	error,
	onInvite,
}) => {
	const [email, setEmail] = useState('');

	// Clear input when status changes to success
	useEffect(() => {
		if (status === 'success') {
			setEmail('');
		}
	}, [status]);

	const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	const isButtonDisabled = !email || !isEmailValid || status === 'loading';

	const handleSubmit = () => {
		if (!isButtonDisabled) {
			onInvite(email);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSubmit();
		}
	};

	return (
		<Stack>
			<FormFeedbackAlert
				status={status === 'error' ? 'error' : 'idle'}
				errorMessage={error ?? undefined}
			/>
			{status === 'success' && (
				<Alert color="green" data-testid="success-alert">
					Invitation sent successfully
				</Alert>
			)}
			<Group align="flex-end">
				<TextInput
					label="Email address"
					placeholder="Enter email to invite"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onKeyDown={handleKeyDown}
					style={{ flex: 1 }}
				/>
				<Button
					onClick={handleSubmit}
					disabled={isButtonDisabled}
					loading={status === 'loading'}
					data-testid="invite-button"
				>
					Invite
				</Button>
			</Group>
		</Stack>
	);
};
