'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
	ActionIcon,
	Badge,
	Group,
	isLightColor,
	Stack,
	Text,
	useMantineTheme,
} from '@mantine/core';
import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';

import { updateRecipeTags } from '@/_actions/saved';
import { TagCombobox, type TagOption } from '@/_components/TagCombobox';

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
	const theme = useMantineTheme();
	const [editing, setEditing] = useState(false);
	const [value, setValue] = useState(tagIds);
	const [saving, setSaving] = useState(false);

	const getPillStyle = (color: string) => {
		const bg = theme.colors[color]?.[5] ?? color;
		return { backgroundColor: bg, color: isLightColor(bg) ? '#000' : '#fff' };
	};

	const selectedTags = value
		.map((id) => availableTags.find((t) => t._id === id))
		.filter((t): t is TagOption => t !== undefined);

	const handleSave = async () => {
		setSaving(true);
		await updateRecipeTags({ plannerId, recipeId, tags: value });
		setSaving(false);
		setEditing(false);
		router.refresh();
	};

	const handleCancel = () => {
		setValue(tagIds);
		setEditing(false);
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
						onClick={() => setEditing(true)}
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
						<Badge key={tag._id} style={getPillStyle(tag.color)}>
							{tag.name}
						</Badge>
					))}
				</Group>
			)}
		</Stack>
	);
};
