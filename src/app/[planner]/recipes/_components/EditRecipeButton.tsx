'use client';

import { useRouter } from 'next/navigation';

import { ActionIcon } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';

import { useCanWrite } from '@/app/[planner]/_components';

type Props = {
	href: string;
};

const EditRecipeButton = ({ href }: Props) => {
	const canWrite = useCanWrite();
	const router = useRouter();

	if (!canWrite) {
		return null;
	}

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
