'use client';

import { Button, Group, Paper, Text } from '@mantine/core';

type Props = {
	// The name of the dish being linked, which may be empty.
	dishName: string;
	onCancel: () => void;
};

// "Linking to <dish>" with Cancel, at the top of the Saved recipes column while a dish is being linked.
export const LinkModeBanner = ({ dishName, onCancel }: Props) => (
	<Paper
		bg="navy.0"
		bd="1px solid navy.5"
		px="sm"
		py={6}
		data-testid="link-mode-banner"
	>
		<Group justify="space-between" wrap="nowrap" gap="xs">
			<Text size="sm" c="navy.5">
				Linking to{' '}
				{dishName.trim() ? (
					<Text span fw={700} inherit>
						{dishName}
					</Text>
				) : (
					'a dish with no name'
				)}
			</Text>
			<Button variant="subtle" size="compact-sm" onClick={onCancel}>
				Cancel
			</Button>
		</Group>
	</Paper>
);
