import {
	ActionIcon,
	Menu,
	MenuDivider,
	MenuDropdown,
	MenuItem,
	MenuTarget,
} from '@mantine/core';
import { IconSettings, IconUser } from '@tabler/icons-react';

import { THEME_COLORS } from '@/_theme/colors';

import { InviteBadge } from './InviteBadge';
import { SignOutButton } from './SignOutButton';

export const UserMenu = () => (
	<Menu>
		<InviteBadge>
			<MenuTarget>
				<ActionIcon
					variant="transparent"
					data-testid="user-avatar"
					suppressHydrationWarning
				>
					<IconUser size={20} color={THEME_COLORS.chalk} />
				</ActionIcon>
			</MenuTarget>
		</InviteBadge>
		<MenuDropdown>
			<MenuItem
				component="a"
				data-testid="settings-link"
				href="/settings"
				leftSection={<IconSettings size={16} color={THEME_COLORS.navy} />}
			>
				Settings
			</MenuItem>
			<MenuDivider />
			<SignOutButton />
		</MenuDropdown>
	</Menu>
);
