import {
	ActionIcon,
	Avatar,
	Menu,
	MenuDropdown,
	MenuTarget,
} from '@mantine/core';

import { SignOutButton } from './SignOutButton';

export const UserMenu = () => (
	<Menu>
		<MenuTarget>
			<ActionIcon variant="transparent">
				<Avatar data-testid="user-avatar" />
			</ActionIcon>
		</MenuTarget>
		<MenuDropdown>
			<SignOutButton />
		</MenuDropdown>
	</Menu>
);
