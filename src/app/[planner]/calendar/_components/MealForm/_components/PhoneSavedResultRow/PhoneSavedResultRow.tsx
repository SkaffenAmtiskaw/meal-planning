'use client';

import { Button, Group, Text } from '@mantine/core';

import type { SavedItem } from '@/_actions/library/types';

import { SavedItemSummary } from '../SavedItemSummary/SavedItemSummary';
import { SourceMark } from '../SourceMark/SourceMark';

type Props = {
	item: SavedItem;
	// The recipe is already on the meal, so there's nothing to use.
	added: boolean;
	onUse: () => void;
};

/**
 * One saved recipe in the phone list: its dot, what it is, then Use, or a muted
 * "Added" for a recipe already on the meal.
 */
export const PhoneSavedResultRow = ({ item, added, onUse }: Props) => (
	<Group wrap="nowrap" gap="sm" py="xs" data-testid="phone-saved-result">
		<SourceMark kind="saved" />
		<Group justify="space-between" wrap="nowrap" gap="sm" flex={1} miw={0}>
			<SavedItemSummary item={item} />
			{added ? (
				<Text size="sm" fw={500} c="var(--text-muted)">
					Added
				</Text>
			) : (
				<Button
					variant="subtle"
					size="compact-md"
					aria-label={`Use ${item.name}`}
					onClick={onUse}
				>
					Use
				</Button>
			)}
		</Group>
	</Group>
);
