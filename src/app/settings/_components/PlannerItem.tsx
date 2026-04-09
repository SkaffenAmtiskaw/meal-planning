'use client';

import { Alert, Anchor, Button, Group, Stack, TextInput } from '@mantine/core';

import { useRenamePlanner } from './useRenamePlanner';

type Props = {
	id: string;
	name: string;
};

export const PlannerItem = ({ id, name }: Props) => {
	const {
		editing,
		name: editName,
		setName,
		loading,
		error,
		enterEditing,
		cancel,
		save,
	} = useRenamePlanner(id, name);

	if (editing) {
		return (
			<Stack>
				<TextInput
					data-testid="planner-name-input"
					label="Planner name"
					value={editName}
					onChange={(e) => setName(e.currentTarget.value)}
				/>
				{error && (
					<Alert color="red" data-testid="rename-error">
						{error}
					</Alert>
				)}
				<Group>
					<Button
						loading={loading}
						data-testid="save-name-button"
						onClick={save}
					>
						Save
					</Button>
					<Button
						variant="subtle"
						data-testid="cancel-rename-button"
						onClick={cancel}
					>
						Cancel
					</Button>
				</Group>
			</Stack>
		);
	}

	return (
		<Group>
			<Anchor href={`/${id}/calendar`} data-testid="planner-link">
				{name}
			</Anchor>
			<Button
				variant="subtle"
				size="xs"
				data-testid="rename-button"
				onClick={enterEditing}
			>
				Rename
			</Button>
		</Group>
	);
};
