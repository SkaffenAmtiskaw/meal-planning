import {
	ActionIcon,
	Menu,
	MenuDivider,
	MenuDropdown,
	MenuTarget,
} from '@mantine/core';
import { IconUser } from '@tabler/icons-react';

import { InviteBadge } from './InviteBadge';
import { SettingsMenuItem } from './SettingsMenuItem';
import { SignOutButton } from './SignOutButton';

export const UserMenu = () => (
	<Menu>
		<InviteBadge>
			<MenuTarget>
				{/* Menu gives its target a generated id, and the id the browser generates here, inside
				    InviteBadge's Suspense boundary, doesn't match the server's. */}
				<ActionIcon
					variant="transparent"
					data-testid="user-avatar"
					suppressHydrationWarning
				>
					<IconUser size={20} color="var(--mantine-color-chalk-5)" />
				</ActionIcon>
			</MenuTarget>
		</InviteBadge>
		<MenuDropdown>
			<SettingsMenuItem />
			<MenuDivider />
			<SignOutButton />
		</MenuDropdown>
	</Menu>
);
