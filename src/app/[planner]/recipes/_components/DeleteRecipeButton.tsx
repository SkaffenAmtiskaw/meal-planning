'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { deleteRecipe } from '@/_actions/saved';
import { useFormFeedback } from '@/_hooks';

import { DeleteConfirmModal } from './DeleteConfirmModal';

type Props = {
	plannerId: string;
	recipeId: string;
	disabled?: boolean;
};

const DeleteRecipeButton = ({ disabled, plannerId, recipeId }: Props) => {
	const router = useRouter();
	const [opened, setOpened] = useState(false);
	const { status, errorMessage, wrap } = useFormFeedback({
		successDuration: 0,
	});

	const handleConfirm = wrap(
		async () => {
			await deleteRecipe({ plannerId, recipeId });
		},
		() => {
			setOpened(false);
			router.refresh();
		},
	);

	return (
		<>
			<ActionIcon
				color="red"
				data-testid="delete-button"
				disabled={disabled}
				onClick={disabled ? undefined : () => setOpened(true)}
				variant="subtle"
			>
				<IconTrash size={16} />
			</ActionIcon>
			<DeleteConfirmModal
				errorMessage={errorMessage}
				loading={status === 'submitting'}
				onClose={() => setOpened(false)}
				onConfirm={handleConfirm}
				opened={opened}
			/>
		</>
	);
};

export { DeleteRecipeButton };
