'use client';

import { Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { useDish } from '../../_hooks/useDish';
import { savedItemName } from '../../_utils/savedItemName';
import { SectionLabel } from '../SectionLabel/SectionLabel';
import { SourceMark } from '../SourceMark/SourceMark';

/**
 * The RECIPE part of a dish's panel. With a saved recipe linked, its name with
 * Change and Remove. Otherwise, "Link a saved recipe" and the reference field.
 * Change and "Link a saved recipe" both start linking.
 */
export const DishRecipeSection = () => {
	const { dish, unlinkDish, setReference, startLinking } = useDish();
	const { source } = dish;
	const savedItems = usePlannerSavedItems();
	const startLinkingDish = () => startLinking(dish.key);

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
						<Button
							variant="subtle"
							size="compact-sm"
							onClick={startLinkingDish}
						>
							Change
						</Button>
						<Button
							variant="subtle"
							color="red"
							size="compact-sm"
							onClick={() => unlinkDish(dish.key)}
						>
							Remove
						</Button>
					</Group>
				</>
			) : (
				<>
					<Button fullWidth onClick={startLinkingDish}>
						Link a saved recipe
					</Button>
					<Text size="xs" c="var(--text-muted)">
						or add a reference
					</Text>
					<TextInput
						aria-label="Reference"
						placeholder="URL, or book and page"
						value={source?.text ?? ''}
						onChange={(e) => setReference(dish.key, e.currentTarget.value)}
					/>
				</>
			)}
		</Stack>
	);
};
