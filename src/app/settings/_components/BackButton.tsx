import { ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

export const BackButton = ({ href }: { href: string }) => (
	<ActionIcon
		component="a"
		data-testid="back-button"
		href={href}
		variant="transparent"
	>
		<IconArrowLeft />
	</ActionIcon>
);
