import { AppShellHeader, Group, Image } from '@mantine/core';

import { UserMenu } from '@/_components';

interface Props {
	leftSection?: React.ReactNode;
}

export const Header = ({ leftSection }: Props) => (
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
			<UserMenu />
		</Group>
	</AppShellHeader>
);
