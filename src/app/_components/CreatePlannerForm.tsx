'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert, Button, Group, Modal, Stack, TextInput } from '@mantine/core';

import { createPlanner } from '@/_actions/planner';

type Props = {
	opened: boolean;
	onClose: () => void;
};

export const CreatePlannerForm = ({ opened, onClose }: Props) => {
	const router = useRouter();
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
		setName('');
		onClose();
		router.refresh();
	};

	const handleClose = () => {
		setName('');
		setError(null);
		onClose();
	};

	return (
		<Modal opened={opened} onClose={handleClose} title="New Planner">
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
						onClick={handleClose}
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
		</Modal>
	);
};
