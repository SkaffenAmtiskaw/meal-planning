'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert, Button, Group, Stack, Text, TextInput } from '@mantine/core';

import { updateUserName } from '@/_actions/user';

type Props = {
	currentName: string;
};

export const ChangeNameForm = ({ currentName }: Props) => {
	const router = useRouter();
	const [showForm, setShowForm] = useState(false);
	const [name, setName] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		setError(null);
		setLoading(true);

		const result = await updateUserName(name);

		setLoading(false);

		if (!result.ok) {
			setError(result.error);
			return;
		}

		setShowForm(false);
		setName('');
		router.refresh();
	};

	return (
		<Stack>
			<Text data-testid="current-name">{currentName}</Text>
			{!showForm ? (
				<Button
					variant="subtle"
					size="xs"
					w="fit-content"
					data-testid="change-name-button"
					onClick={() => setShowForm(true)}
				>
					Change name
				</Button>
			) : (
				<Stack>
					<TextInput
						data-testid="new-name-input"
						label="New name"
						placeholder="New User"
						value={name}
						onChange={(e) => setName(e.currentTarget.value)}
					/>
					{error && (
						<Alert color="red" data-testid="error-alert">
							{error}
						</Alert>
					)}
					<Group>
						<Button
							loading={loading}
							data-testid="submit-name-change-button"
							onClick={handleSubmit}
						>
							Save name
						</Button>
						<Button
							variant="subtle"
							data-testid="cancel-name-change-button"
							onClick={() => {
								setShowForm(false);
								setName('');
							}}
						>
							Cancel
						</Button>
					</Group>
				</Stack>
			)}
		</Stack>
	);
};
