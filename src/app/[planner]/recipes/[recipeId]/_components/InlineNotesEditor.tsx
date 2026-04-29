'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ActionIcon, Group, Stack, Text, Textarea } from '@mantine/core';
import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';

import { updateRecipeNotes } from '@/_actions/saved';
import { useEditMode } from '@/_hooks/useEditMode';
import { catchify } from '@/_utils/catchify';

type Props = {
	plannerId: string;
	recipeId: string;
	notes: string | undefined;
};

export const InlineNotesEditor = ({ plannerId, recipeId, notes }: Props) => {
	const router = useRouter();
	const [editing, { enterEditing, exitEditing }] = useEditMode();
	const [value, setValue] = useState(notes ?? '');
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

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
		router.refresh();
	};

	const handleCancel = () => {
		setValue(notes ?? '');
		exitEditing();
		setSaveError(null);
	};

	return (
		<Stack gap={4}>
			<Group gap="xs" align="center">
				<Text fw={600} size="sm">
					Notes
				</Text>
				{!editing && (
					<ActionIcon
						data-testid="notes-edit-button"
						onClick={enterEditing}
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
