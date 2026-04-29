'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ActionIcon, Group, Stack, Text } from '@mantine/core';
import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';

import { updateRecipeTags } from '@/_actions/saved';
import { Tag, TagCombobox, type TagOption } from '@/_components';
import { useEditMode } from '@/_hooks/useEditMode';
import type { TagColor } from '@/_theme/colors';
import { catchify } from '@/_utils/catchify';

type Props = {
	plannerId: string;
	recipeId: string;
	tagIds: string[];
	availableTags: TagOption[];
};

export const InlineTagsEditor = ({
	plannerId,
	recipeId,
	tagIds,
	availableTags,
}: Props) => {
	const router = useRouter();
	const [editing, { enterEditing, exitEditing }] = useEditMode();
	const [value, setValue] = useState(tagIds);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	const selectedTags = value
		.map((id) => availableTags.find((t) => t._id === id))
		.filter((t): t is TagOption => t !== undefined);

	const handleSave = async () => {
		setSaving(true);
		setSaveError(null);
		const [result, error] = await catchify(() =>
			updateRecipeTags({ plannerId, recipeId, tags: value }),
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
		setValue(tagIds);
		exitEditing();
		setSaveError(null);
	};

	return (
		<Stack gap={4}>
			<Group gap="xs" align="center">
				<Text fw={600} size="sm">
					Tags
				</Text>
				{!editing && (
					<ActionIcon
						data-testid="tags-edit-button"
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
							data-testid="tags-save-button"
							disabled={saving}
							onClick={handleSave}
							size="xs"
							variant="subtle"
						>
							<IconCheck size={14} />
						</ActionIcon>
						<ActionIcon
							data-testid="tags-cancel-button"
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
				<TagCombobox
					plannerId={plannerId}
					initialTags={availableTags}
					value={value}
					onChange={setValue}
				/>
			) : (
				<Group gap="xs" data-testid="tags">
					{selectedTags.map((tag) => (
						<Tag key={tag._id} color={tag.color as TagColor}>
							{tag.name}
						</Tag>
					))}
				</Group>
			)}
		</Stack>
	);
};
