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
	message: React.ReactNode;
	confirmButtonText?: string;
};

export const ConfirmModal = ({
	errorMessage,
	loading,
	message,
	onClose,
	onConfirm,
	opened,
	title,
	confirmButtonText = 'Confirm',
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
				data-testid="confirm-button"
				loading={loading}
				onClick={onConfirm}
			>
				{confirmButtonText}
			</Button>
		</Group>
	</Modal>
);
