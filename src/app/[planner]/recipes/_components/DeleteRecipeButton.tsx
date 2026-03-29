'use client';

import { useRouter } from 'next/navigation';

import { ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { deleteRecipe } from '@/_actions/saved';

type Props = {
	plannerId: string;
	recipeId: string;
	disabled?: boolean;
};

const DeleteRecipeButton = ({ plannerId, recipeId, disabled }: Props) => {
	const router = useRouter();

	const handleDelete = async () => {
		await deleteRecipe({ plannerId, recipeId });
		router.refresh();
	};

	return (
		<ActionIcon
			color="red"
			data-testid="delete-button"
			disabled={disabled}
			onClick={disabled ? undefined : handleDelete}
			variant="subtle"
		>
			<IconTrash size={16} />
		</ActionIcon>
	);
};

export { DeleteRecipeButton };
