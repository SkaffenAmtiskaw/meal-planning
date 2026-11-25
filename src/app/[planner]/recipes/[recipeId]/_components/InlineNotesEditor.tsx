'use client';

import { useState } from 'react';

import { ActionIcon, Group, Stack, Text, Textarea } from '@mantine/core';
import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';

import { updateRecipeNotes } from '@/_actions/library';
import { useEditMode } from '@/_hooks/useEditMode';
import { catchify } from '@/_utils/catchify';
import { useCanWrite } from '@/app/[planner]/_components';

type Props = {
	plannerId: string;
	recipeId: string;
	notes: string | undefined;
};

export const InlineNotesEditor = ({ plannerId, recipeId, notes }: Props) => {
	const canWrite = useCanWrite();
	const [editing, { enterEditing, exitEditing }] = useEditMode();
	// The edit in progress. View mode draws from `notes`, so a server refresh
	// shows there, and each edit starts from the notes as they are then.
	const [value, setValue] = useState(notes ?? '');
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	const handleEdit = () => {
		setValue(notes ?? '');
		enterEditing();
	};

	const handleSave = async () => {
		setSaving(true);
		setSaveError(null);
		const [result, error] = await catchify(() =>
			updateRecipeNotes({ plannerId, recipeId, notes: value }),
		);
		setSaving(false);
		if (error || !result) {
			setSaveError('An unexpected error occurred');
			return;
		}
		if (!result.ok) {
			setSaveError(result.error);
			return;
		}
		exitEditing();
	};

	const handleCancel = () => {
		exitEditing();
		setSaveError(null);
	};

	return (
		<Stack gap={4}>
			<Group gap="xs" align="center">
				<Text fw={600} size="sm">
					Notes
				</Text>
				{canWrite && !editing && (
					<ActionIcon
						data-testid="notes-edit-button"
						onClick={handleEdit}
						size="xs"
						variant="subtle"
					>
						<IconPencil size={14} />
					</ActionIcon>
				)}
				{editing && (
					<>
						<ActionIcon
							data-testid="notes-save-button"
							disabled={saving}
							onClick={handleSave}
							size="xs"
							variant="subtle"
						>
							<IconCheck size={14} />
						</ActionIcon>
						<ActionIcon
							data-testid="notes-cancel-button"
							disabled={saving}
							onClick={handleCancel}
							size="xs"
							variant="subtle"
						>
							<IconX size={14} />
						</ActionIcon>
					</>
				)}
			</Group>
			{saveError && (
				<Text c="red" data-testid="save-error" size="xs">
					{saveError}
				</Text>
			)}
			{editing ? (
				<Textarea
					autosize
					data-testid="notes-textarea"
					minRows={3}
					onChange={(e) => setValue(e.currentTarget.value)}
					value={value}
				/>
			) : (
				<Text data-testid="notes">{notes}</Text>
			)}
		</Stack>
	);
};
