import { AppShellHeader, Group, Image } from '@mantine/core';

import { UserMenu } from '@/_components/UserMenu';

interface Props {
	leftSection?: React.ReactNode;
	rightSection?: React.ReactNode;
}

export const Header = ({ leftSection, rightSection }: Props) => (
	<AppShellHeader>
		<Group h="100%" justify="space-between" px="sm">
			<Group gap="xs">
				{leftSection}
				<Image
					src="/weeknight-header-dark.svg"
					alt="weeknight"
					w={140}
					h={24}
					fit="contain"
				/>
			</Group>
			{rightSection || <UserMenu />}
		</Group>
	</AppShellHeader>
);
