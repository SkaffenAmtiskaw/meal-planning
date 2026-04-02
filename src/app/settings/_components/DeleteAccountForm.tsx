'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert, Button, Stack, Text, TextInput } from '@mantine/core';

import { deleteAccount } from '@/_actions/user';
import { client } from '@/_utils/auth';

export const DeleteAccountForm = () => {
	const router = useRouter();
	const [value, setValue] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		setError(null);
		setLoading(true);

		const result = await deleteAccount();

		if (!result.ok) {
			setError(result.error);
			setLoading(false);
			return;
		}

		await client.signOut();
		router.push('/');
	};

	return (
		<Stack>
			<Text>This will permanently delete your account and all your data.</Text>
			<TextInput
				data-testid="delete-confirmation-input"
				label="Type DELETE to confirm"
				placeholder="DELETE"
				value={value}
				onChange={(e) => setValue(e.currentTarget.value)}
			/>
			{error && (
				<Alert color="red" data-testid="error-alert">
					{error}
				</Alert>
			)}
			<Button
				color="red"
				disabled={value !== 'DELETE'}
				loading={loading}
				data-testid="delete-account-button"
				onClick={handleDelete}
			>
				Delete account
			</Button>
		</Stack>
	);
};
