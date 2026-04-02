import { AppShellHeader, Group } from '@mantine/core';

import { UserMenu } from '@/_components';

interface Props {
	leftSection?: React.ReactNode;
}

export const Header = ({ leftSection }: Props) => (
	<AppShellHeader>
		<Group h="100%" justify="space-between" px="sm">
			{leftSection}
			<UserMenu />
		</Group>
	</AppShellHeader>
);
