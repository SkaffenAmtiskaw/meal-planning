import {
	ActionIcon,
	Avatar,
	Menu,
	MenuDivider,
	MenuDropdown,
	MenuItem,
	MenuTarget,
} from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';

import { THEME_COLORS } from '@/_theme/colors';

import { SignOutButton } from './SignOutButton';

export const UserMenu = () => (
	<Menu>
		<MenuTarget>
			<ActionIcon variant="transparent">
				<Avatar data-testid="user-avatar" color={THEME_COLORS.chalk} />
			</ActionIcon>
		</MenuTarget>
		<MenuDropdown>
			<MenuItem
				component="a"
				data-testid="settings-link"
				href="/settings"
				leftSection={<IconSettings size={16} color={THEME_COLORS.chalk} />}
			>
				Settings
			</MenuItem>
			<MenuDivider />
			<SignOutButton />
		</MenuDropdown>
	</Menu>
);
