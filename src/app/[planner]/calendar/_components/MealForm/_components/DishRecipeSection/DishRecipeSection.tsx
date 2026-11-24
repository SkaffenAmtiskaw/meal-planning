'use client';

import { Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core';

import type { DishSource } from '@/_actions/calendar/types';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { savedItemName } from '../../_utils/savedItemName';
import { SectionLabel } from '../SectionLabel/SectionLabel';
import { SourceMark } from '../SourceMark/SourceMark';

type Props = {
	source: DishSource | null;
	onUnlink: () => void;
	onReferenceChange: (text: string) => void;
};

/**
 * The RECIPE part of a dish's panel. With a saved recipe linked, its name with
 * Change and Remove. Otherwise, "Link a saved recipe" and the reference field.
 */
export const DishRecipeSection = ({
	source,
	onUnlink,
	onReferenceChange,
}: Props) => {
	const savedItems = usePlannerSavedItems();

	return (
		<Stack gap={6}>
			<SectionLabel>Recipe</SectionLabel>
			{source?.kind === 'saved' ? (
				<>
					<Paper withBorder px="sm" py={8}>
						<Group gap="xs" wrap="nowrap">
							<SourceMark kind="saved" />
							<Text size="sm">{savedItemName(savedItems, source.savedId)}</Text>
						</Group>
					</Paper>
					<Group gap={4}>
						<Button variant="subtle" size="compact-sm">
							Change
						</Button>
						<Button
							variant="subtle"
							color="red"
							size="compact-sm"
							onClick={onUnlink}
						>
							Remove
						</Button>
					</Group>
				</>
			) : (
				<>
					<Button fullWidth>Link a saved recipe</Button>
					<Text size="xs" c="var(--text-muted)">
						or add a reference
					</Text>
					<TextInput
						aria-label="Reference"
						placeholder="URL, or book and page"
						value={source?.text ?? ''}
						onChange={(e) => onReferenceChange(e.currentTarget.value)}
					/>
				</>
			)}
		</Stack>
	);
};
