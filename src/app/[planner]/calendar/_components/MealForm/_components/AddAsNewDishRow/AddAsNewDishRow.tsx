'use client';

import { Button, Group, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

type Props = {
	// What's typed in the dish's name field.
	text: string;
	onAdd: () => void;
};

/**
 * The phone list's last row: keeps what's typed as a new dish, with no recipe
 * linked. Before anything is typed, it asks for a name and does nothing.
 */
export const AddAsNewDishRow = ({ text, onAdd }: Props) => {
	if (text.trim() === '') {
		return (
			<Group gap="xs" wrap="nowrap" py={6} c="var(--text-muted)">
				<IconPlus size={16} aria-hidden />
				<Text size="sm">Type a name for a new dish</Text>
			</Group>
		);
	}

	return (
		<Button
			variant="subtle"
			justify="flex-start"
			fullWidth
			px={0}
			leftSection={<IconPlus size={16} />}
			onClick={onAdd}
		>
			Add “{text}” as a new dish
		</Button>
	);
};
