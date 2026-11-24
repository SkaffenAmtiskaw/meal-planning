'use client';

import { Button, Group, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import type { SavedItem } from '@/_actions/library/types';
import { useIsMobile } from '@/_hooks';

import { formatDishCount } from '../../_utils/formatDishCount';
import type { DishDraft } from '../../types';
import { DishRow } from '../DishRow/DishRow';
import { SectionLabel } from '../SectionLabel/SectionLabel';

type Props = {
	dishes: DishDraft[];
	// How many dishes will be saved, so blank rows aren't counted.
	dishCount: number;
	// The dishes whose rows show the nameless error.
	namelessKeys?: ReadonlySet<string>;
	// The dish being linked to a saved recipe, if any.
	linkingKey?: string | null;
	// The saved recipes already on the meal.
	linkedIds: ReadonlySet<string>;
	// The dish whose saved list is open on a phone, if any.
	openListKey: string | null;
	onAddDish: () => void;
	onRenameDish: (key: string, name: string) => void;
	onRemoveDish: (key: string) => void;
	onUnlinkDish: (key: string) => void;
	onSetReference: (key: string, text: string) => void;
	onSetNote: (key: string, note: string) => void;
	onStartLinking: (dish: DishDraft) => void;
	onOpenList: (key: string) => void;
	onCloseList: () => void;
	onChooseRecipe: (key: string, item: SavedItem) => void;
};

// DISHES with its count, a row for each dish, then Add dish.
export const DishList = ({
	dishes,
	dishCount,
	namelessKeys = new Set(),
	linkingKey = null,
	onAddDish,
	onRenameDish,
	onRemoveDish,
	onUnlinkDish,
	onSetReference,
	onSetNote,
	onStartLinking,
	linkedIds,
	openListKey,
	onOpenList,
	onCloseList,
	onChooseRecipe,
}: Props) => {
	const isMobile = useIsMobile();

	return (
		<Stack gap="xs">
			{/* A phone puts the count at the far end of the line, as its narrow column has room for nothing else there. */}
			<Group gap="xs" justify={isMobile ? 'space-between' : 'flex-start'}>
				<SectionLabel>Dishes</SectionLabel>
				<Text size="xs" c="var(--text-muted)">
					{formatDishCount(dishCount)}
				</Text>
			</Group>
			{dishes.map((dish) => (
				<DishRow
					key={dish.key}
					dish={dish}
					canDelete={dishes.length > 1}
					nameless={namelessKeys.has(dish.key)}
					linking={dish.key === linkingKey}
					onRename={(name) => onRenameDish(dish.key, name)}
					onDelete={() => onRemoveDish(dish.key)}
					onUnlink={() => onUnlinkDish(dish.key)}
					onReferenceChange={(text) => onSetReference(dish.key, text)}
					onNoteChange={(note) => onSetNote(dish.key, note)}
					onStartLinking={() => onStartLinking(dish)}
					linkedIds={linkedIds}
					listOpen={dish.key === openListKey}
					onOpenList={() => onOpenList(dish.key)}
					onCloseList={onCloseList}
					onChooseRecipe={(item) => onChooseRecipe(dish.key, item)}
				/>
			))}
			<Button
				variant="dashed"
				size="md"
				fullWidth
				leftSection={<IconPlus size={16} />}
				onClick={onAddDish}
			>
				Add dish
			</Button>
		</Stack>
	);
};
