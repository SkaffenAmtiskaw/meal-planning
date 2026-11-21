'use client';

import { useState } from 'react';

import { Alert, Button, Group, Stack, TextInput } from '@mantine/core';

import { createPlanner } from '@/_actions/planner';

type Props = {
	onCancel: () => void;
	onSuccess: () => void;
};

export const CreatePlannerForm = ({ onCancel, onSuccess }: Props) => {
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleCreate = async () => {
		setLoading(true);
		setError(null);
		const result = await createPlanner(name);
		setLoading(false);
		if (!result.ok) {
			setError(result.error);
			return;
		}
		onSuccess();
	};

	return (
		<Stack>
			<TextInput
				data-testid="new-planner-name-input"
				label="Planner name"
				placeholder="e.g. Weekend Meals"
				value={name}
				onChange={(e) => setName(e.currentTarget.value)}
			/>
			{error && (
				<Alert color="red" data-testid="create-planner-error">
					{error}
				</Alert>
			)}
			<Group justify="flex-end">
				<Button
					variant="subtle"
					data-testid="cancel-create-button"
					onClick={onCancel}
				>
					Cancel
				</Button>
				<Button
					variant="cta"
					loading={loading}
					data-testid="create-planner-button"
					onClick={handleCreate}
				>
					Create
				</Button>
			</Group>
		</Stack>
	);
};
