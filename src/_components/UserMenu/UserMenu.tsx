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

import { SignOutButton } from './SignOutButton';

export const UserMenu = () => (
	<Menu>
		<MenuTarget>
			<ActionIcon variant="transparent">
				<Avatar data-testid="user-avatar" />
			</ActionIcon>
		</MenuTarget>
		<MenuDropdown>
			<MenuItem
				component="a"
				data-testid="settings-link"
				href="/settings"
				leftSection={<IconSettings size={16} />}
			>
				Settings
			</MenuItem>
			<MenuDivider />
			<SignOutButton />
		</MenuDropdown>
	</Menu>
);
