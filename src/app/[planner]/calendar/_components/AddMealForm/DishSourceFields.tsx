'use client';

import {
	Input,
	SegmentedControl,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';

import type { DishState, SourceType } from './types';
import classes from './DishRow.module.css';

import { usePlannerSavedItems } from '../../_hooks/usePlannerSavedItems';

type Props = {
	dish: DishState;
	index: number;
	onUpdate: (patch: Partial<DishState>) => void;
};

export const DishSourceFields = ({ dish, index, onUpdate }: Props) => {
	const savedItems = usePlannerSavedItems();

	return (
		<Stack gap={7} className={classes.sourceColumn}>
			<Input.Label className={classes.label}>Source</Input.Label>
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

			{dish.sourceType === 'none' && (
				<div className={classes.hiddenSourcePlaceholder} aria-hidden="true">
					<Stack gap={7}>
						<TextInput
							disabled
							data-testid={`dish-source-placeholder-${index}`}
						/>
						<Text className={classes.helperHint}>
							Search your saved recipes and bookmarks.
						</Text>
					</Stack>
				</div>
			)}

			{dish.sourceType === 'saved' && (
				<>
					<Select
						data-testid={`dish-saved-${index}`}
						placeholder="Choose a saved item…"
						searchable
						data={savedItems.map((item) => ({
							value: item._id,
							label: item.name,
						}))}
						value={dish.savedId || null}
						onChange={(value) => onUpdate({ savedId: value ?? '' })}
					/>
					<Text className={classes.helperHint}>
						Search your saved recipes and bookmarks.
					</Text>
				</>
			)}

			{dish.sourceType === 'text' && (
				<>
					<TextInput
						data-testid={`dish-source-text-${index}`}
						placeholder="https://…"
						value={dish.sourceText}
						onChange={(e) => onUpdate({ sourceText: e.currentTarget.value })}
					/>
					<Text className={classes.helperHint}>
						A URL, or a book and page — “Dinner in French, p. 88”.
					</Text>
				</>
			)}
		</Stack>
	);
};
