'use client';

import Link from 'next/link';

import { ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

export const BackButton = ({ href }: { href: string }) => (
	<ActionIcon
		component={Link}
		color="white"
		data-testid="back-button"
		href={href}
		variant="transparent"
	>
		<IconArrowLeft />
	</ActionIcon>
);
