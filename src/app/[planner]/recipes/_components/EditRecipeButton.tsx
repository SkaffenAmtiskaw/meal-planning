'use client';

import { useRouter } from 'next/navigation';

import { ActionIcon } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';

type Props = {
	href: string;
};

const EditRecipeButton = ({ href }: Props) => {
	const router = useRouter();

	return (
		<ActionIcon
			data-testid="edit-button"
			onClick={() => router.push(href)}
			variant="subtle"
		>
			<IconPencil size={16} />
		</ActionIcon>
	);
};

export { EditRecipeButton };
