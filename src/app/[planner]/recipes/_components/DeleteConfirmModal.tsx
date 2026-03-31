'use client';

import { Button, Group, Modal, Text } from '@mantine/core';

import { FormFeedbackAlert } from '@/_components';

type Props = {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	loading: boolean;
	errorMessage?: string;
	title: string;
	message: string;
};

export const DeleteConfirmModal = ({
	errorMessage,
	loading,
	message,
	onClose,
	onConfirm,
	opened,
	title,
}: Props) => (
	<Modal onClose={onClose} opened={opened} title={title}>
		<Text>{message}</Text>
		<FormFeedbackAlert
			status={errorMessage ? 'error' : 'idle'}
			errorMessage={errorMessage}
		/>
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
