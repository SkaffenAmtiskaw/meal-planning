'use client';

import {
	Button,
	Fieldset,
	Group,
	Input,
	SegmentedControl,
	Select,
	Stack,
	Textarea,
	TextInput,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import type { DishState, SourceType } from './types';

import { usePlannerSavedItems } from '../../_hooks/usePlannerSavedItems';

type Props = {
	dish: DishState;
	index: number;
	showRemove: boolean;
	onUpdate: (patch: Partial<DishState>) => void;
	onRemove: () => void;
};

export const DishRow = ({
	dish,
	index,
	showRemove,
	onUpdate,
	onRemove,
}: Props) => {
	const savedItems = usePlannerSavedItems();

	return (
		<Fieldset data-testid={`dish-row-${index}`}>
			<Stack gap="xs">
				<Group align="flex-end">
					<TextInput
						label="Dish name"
						style={{ flex: 1 }}
						data-testid={`dish-name-${index}`}
						value={dish.name}
						onChange={(e) => onUpdate({ name: e.currentTarget.value })}
					/>
					{showRemove && (
						<Button
							variant="subtle"
							color="red"
							size="compact-sm"
							data-testid={`dish-remove-${index}`}
							onClick={onRemove}
						>
							<IconTrash size={16} />
						</Button>
					)}
				</Group>

				<Stack gap={4}>
					<Input.Label>Source</Input.Label>
					<SegmentedControl
						data-testid={`dish-source-type-${index}`}
						value={dish.sourceType}
						onChange={(value) => onUpdate({ sourceType: value as SourceType })}
						data={[
							{ label: 'None', value: 'none' },
							{ label: 'Saved', value: 'saved' },
							{ label: 'Reference', value: 'text' },
						]}
					/>
				</Stack>

				{dish.sourceType === 'saved' && (
					<Select
						label="Saved recipe / bookmark"
						data-testid={`dish-saved-${index}`}
						searchable
						data={savedItems.map((item) => ({
							value: item._id,
							label: item.name,
						}))}
						value={dish.savedId || null}
						onChange={(value) => onUpdate({ savedId: value ?? '' })}
					/>
				)}

				{dish.sourceType === 'text' && (
					<TextInput
						label="URL or reference"
						data-testid={`dish-source-text-${index}`}
						value={dish.sourceText}
						onChange={(e) => onUpdate({ sourceText: e.currentTarget.value })}
					/>
				)}

				<Button
					variant="subtle"
					size="compact-xs"
					mt="xs"
					data-testid={`dish-note-toggle-${index}`}
					onClick={() =>
						onUpdate({
							noteExpanded: !dish.noteExpanded,
							...(dish.noteExpanded && { note: '' }),
						})
					}
				>
					{dish.noteExpanded ? 'Remove note' : 'Add note'}
				</Button>

				{dish.noteExpanded && (
					<Textarea
						label="Note"
						data-testid={`dish-note-${index}`}
						value={dish.note}
						onChange={(e) => onUpdate({ note: e.currentTarget.value })}
					/>
				)}
			</Stack>
		</Fieldset>
	);
};
