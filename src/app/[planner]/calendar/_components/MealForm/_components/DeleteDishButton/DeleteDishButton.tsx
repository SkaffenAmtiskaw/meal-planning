'use client';

import { ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';

import { ConfirmModal } from '@/_components';

import { useMealDishes } from '../../../_hooks/useMealForm';
import { useDish } from '../../_hooks/useDish';

/**
 * The trash icon, which asks before it deletes the dish. Deleting a dish only
 * changes the form's values, so it uses ConfirmModal directly rather than
 * ConfirmButton, which runs an action.
 */
export const DeleteDishButton = () => {
	const { dish } = useDish();
	const { deleteDish } = useMealDishes();
	const [opened, { open, close }] = useDisclosure(false);

	const confirm = () => {
		close();
		deleteDish(dish.key);
	};

	return (
		<>
			<ActionIcon
				variant="subtle"
				color="red"
				size="input-sm"
				aria-label="Delete dish"
				onClick={open}
			>
				<IconTrash size={18} />
			</ActionIcon>
			<ConfirmModal
				opened={opened}
				onClose={close}
				onConfirm={confirm}
				loading={false}
				title="Delete Dish"
				message={
					dish.name
						? `Remove "${dish.name}" from this meal?`
						: 'Remove this dish from this meal?'
				}
				confirmButtonText="Delete"
			/>
		</>
	);
};
