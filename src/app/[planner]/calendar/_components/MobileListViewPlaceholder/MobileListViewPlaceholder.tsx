'use client';

import type { ReactElement } from 'react';

import { Center, Stack, Text } from '@mantine/core';
import { IconListDetails } from '@tabler/icons-react';

export function MobileListViewPlaceholder(): ReactElement {
	return (
		<Center h="100%">
			<Stack align="center" gap="xs">
				<IconListDetails
					size={48}
					stroke={1.5}
					color="var(--mantine-color-forest-6)"
				/>
				<Text c="navy.4" size="lg" fw={500}>
					Coming soon
				</Text>
			</Stack>
		</Center>
	);
}
