'use client';

import { type KeyboardEvent, type Ref, useState } from 'react';

import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

import { useEscapeLayer } from '@/_hooks';

import { searchKeyIntent } from '../../_utils/searchKeyIntent';

type Props = {
	value: string;
	onChange: (search: string) => void;
	// A dish is being linked, so Esc is left to link mode.
	linking: boolean;
	onMoveDown: () => void;
	onMoveUp: () => void;
	// Runs the highlighted result's action.
	onRun: () => void;
	// So the form can put the cursor here when linking starts.
	ref?: Ref<HTMLInputElement>;
};

/**
 * The Saved recipes column's search field. ↓ and ↑ move the results'
 * highlight, Enter runs the highlighted result, and Esc empties a search with
 * text. Enter never submits the meal form, even with nothing highlighted.
 */
export const SavedSearchInput = ({
	value,
	onChange,
	linking,
	onMoveDown,
	onMoveUp,
	onRun,
	ref,
}: Props) => {
	const hasText = value !== '';
	const [focused, setFocused] = useState(false);
	// While it has text and focus, Esc clears the search rather than closing the modal.
	useEscapeLayer(hasText && focused);

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		const intent = searchKeyIntent(
			{ key: event.key, isComposing: event.nativeEvent.isComposing },
			{ hasText, linking },
		);
		switch (intent) {
			case 'moveDown':
				// Keeps the caret where it is.
				event.preventDefault();
				onMoveDown();
				break;
			case 'moveUp':
				event.preventDefault();
				onMoveUp();
				break;
			case 'run':
				// Keeps Enter from submitting the meal form.
				event.preventDefault();
				onRun();
				break;
			case 'clear':
				onChange('');
				break;
		}
	};

	return (
		<TextInput
			ref={ref}
			aria-label="Search saved recipes"
			placeholder="Search saved recipes"
			leftSection={<IconSearch size={16} />}
			value={value}
			onChange={(event) => onChange(event.currentTarget.value)}
			onKeyDown={handleKeyDown}
			onFocus={() => setFocused(true)}
			onBlur={() => setFocused(false)}
		/>
	);
};
