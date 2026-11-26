import { Text } from '@mantine/core';

type Props = {
	// A dish is being linked, so Enter links and Esc ends linking.
	linking: boolean;
};

// The one-line hint under the tag filter naming the keys the search takes.
export const SavedKeyHint = ({ linking }: Props) => (
	<Text size="xs" c="var(--text-muted)">
		{linking
			? '↑↓ move · ↵ link · Esc cancel linking'
			: '↑↓ move · ↵ add · Esc clear search'}
	</Text>
);
