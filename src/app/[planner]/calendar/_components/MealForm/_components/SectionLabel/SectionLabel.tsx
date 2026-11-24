import type { ReactNode } from 'react';

import { Text } from '@mantine/core';

// The small, bold, uppercase label over a part of the form, such as DISHES.
export const SectionLabel = ({ children }: { children: ReactNode }) => (
	<Text size="xs" fw={700} tt="uppercase" lts="0.08em" c="var(--text-muted)">
		{children}
	</Text>
);
