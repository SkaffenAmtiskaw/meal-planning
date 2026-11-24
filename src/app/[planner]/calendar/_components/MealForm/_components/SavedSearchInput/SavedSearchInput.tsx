'use client';

import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

type Props = {
	value: string;
	onChange: (search: string) => void;
};

// The Saved recipes column's search field.
export const SavedSearchInput = ({ value, onChange }: Props) => (
	<TextInput
		aria-label="Search saved recipes"
		placeholder="Search saved recipes"
		leftSection={<IconSearch size={16} />}
		value={value}
		onChange={(event) => onChange(event.currentTarget.value)}
	/>
);
