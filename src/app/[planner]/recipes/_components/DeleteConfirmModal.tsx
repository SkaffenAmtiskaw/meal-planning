'use client';

import { Button, Group, Modal, Text } from '@mantine/core';

type Props = {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	loading: boolean;
};

export const DeleteConfirmModal = ({
	loading,
	onClose,
	onConfirm,
	opened,
}: Props) => (
	<Modal onClose={onClose} opened={opened} title="Delete Recipe">
		<Text>
			Are you sure you want to delete this recipe? This cannot be undone.
		</Text>
		<Group justify="flex-end" mt="md">
			<Button
				data-testid="cancel-button"
				disabled={loading}
				onClick={onClose}
				variant="default"
			>
				Cancel
			</Button>
			<Button
				color="red"
				data-testid="confirm-delete-button"
				loading={loading}
				onClick={onConfirm}
			>
				Delete
			</Button>
		</Group>
	</Modal>
);
