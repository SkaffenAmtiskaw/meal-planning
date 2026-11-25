'use client';

import type { Ref } from 'react';

import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

type Props = {
	value: string;
	onChange: (search: string) => void;
	// So the form can put the cursor here when linking starts.
	ref?: Ref<HTMLInputElement>;
};

// The Saved recipes column's search field.
export const SavedSearchInput = ({ value, onChange, ref }: Props) => (
	<TextInput
		ref={ref}
		aria-label="Search saved recipes"
		placeholder="Search saved recipes"
		leftSection={<IconSearch size={16} />}
		value={value}
		onChange={(event) => onChange(event.currentTarget.value)}
	/>
);
