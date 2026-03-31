'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { useFormFeedback } from '@/_hooks';
import type { ActionResult } from '@/_utils/actionResult';

import { DeleteConfirmModal } from './DeleteConfirmModal';

type Props = {
	onDelete: () => Promise<ActionResult>;
	title: string;
	message: string;
	'data-testid'?: string;
};

const DeleteItemButton = ({
	onDelete,
	title,
	message,
	'data-testid': testId = 'delete-button',
}: Props) => {
	const router = useRouter();
	const [opened, setOpened] = useState(false);
	const { status, errorMessage, wrap } = useFormFeedback({
		successDuration: 0,
	});

	const handleConfirm = wrap(
		async () => onDelete(),
		() => {
			setOpened(false);
			router.refresh();
		},
	);

	return (
		<>
			<ActionIcon
				color="red"
				data-testid={testId}
				onClick={() => setOpened(true)}
				variant="subtle"
			>
				<IconTrash size={16} />
			</ActionIcon>
			<DeleteConfirmModal
				errorMessage={errorMessage}
				loading={status === 'submitting'}
				message={message}
				onClose={() => setOpened(false)}
				onConfirm={handleConfirm}
				opened={opened}
				title={title}
			/>
		</>
	);
};

export { DeleteItemButton };
