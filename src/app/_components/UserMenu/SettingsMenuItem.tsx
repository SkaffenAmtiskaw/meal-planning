'use client';

import Link from 'next/link';

import { MenuItem } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

// A client component because a server component can't pass Link, a function, to MenuItem.
export const SettingsMenuItem = () => (
	<MenuItem
		component={Link}
		data-testid="settings-link"
		href="/settings"
		leftSection={<IconSettings size={16} color="var(--mantine-color-navy-5)" />}
	>
		Settings
	</MenuItem>
);
