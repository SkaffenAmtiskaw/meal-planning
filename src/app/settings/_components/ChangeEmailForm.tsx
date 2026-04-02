'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert, Button, Group, Stack, Text, TextInput } from '@mantine/core';

import { requestEmailChange } from '@/_actions/user';

type PendingEmailChange = {
	email: string;
	expiresAt: Date;
};

type Props = {
	currentEmail: string;
	pendingEmailChange?: PendingEmailChange;
};

export const ChangeEmailForm = ({
	currentEmail,
	pendingEmailChange,
}: Props) => {
	const router = useRouter();
	const [showForm, setShowForm] = useState(false);
	const [newEmail, setNewEmail] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const isPending =
		pendingEmailChange && new Date(pendingEmailChange.expiresAt) > new Date();

	const handleSubmit = async () => {
		setError(null);
		setLoading(true);

		const result = await requestEmailChange(newEmail);

		setLoading(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		const message = result.data.hadPreviousRequest
			? `A verification email was sent to ${newEmail}. Any previous request has been cancelled.`
			: `A verification email was sent to ${newEmail}.`;

		setShowForm(false);
		setNewEmail('');
		setSuccessMessage(message);
		router.refresh();
	};

	return (
		<Stack>
			<Text data-testid="current-email">{currentEmail}</Text>
			{isPending && (
				<Alert color="blue" data-testid="pending-email-alert">
					A verification email was sent to {pendingEmailChange.email} — check
					your inbox.
				</Alert>
			)}
			{successMessage && (
				<Alert color="green" data-testid="success-alert">
					{successMessage}
				</Alert>
			)}
			{!showForm ? (
				<Button
					variant="subtle"
					size="xs"
					w="fit-content"
					data-testid="change-email-button"
					onClick={() => setShowForm(true)}
				>
					Change email
				</Button>
			) : (
				<Stack>
					<TextInput
						data-testid="new-email-input"
						label="New email address"
						placeholder="you@example.com"
						value={newEmail}
						onChange={(e) => setNewEmail(e.currentTarget.value)}
					/>
					{error && (
						<Alert color="red" data-testid="error-alert">
							{error}
						</Alert>
					)}
					<Group>
						<Button
							loading={loading}
							data-testid="submit-email-change-button"
							onClick={handleSubmit}
						>
							Send verification email
						</Button>
						<Button
							variant="subtle"
							data-testid="cancel-email-change-button"
							onClick={() => setShowForm(false)}
						>
							Cancel
						</Button>
					</Group>
				</Stack>
			)}
		</Stack>
	);
};
