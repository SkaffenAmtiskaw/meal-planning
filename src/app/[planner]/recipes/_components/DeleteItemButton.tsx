'use client';

import { useRouter } from 'next/navigation';

import { ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';

import { useFormFeedback } from '@/_hooks';
import type { ActionResult } from '@/_utils/actionResult';
import { useCanWrite } from '@/app/[planner]/_components';

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
	const [opened, handlers] = useDisclosure(false);
	const { status, errorMessage, wrap } = useFormFeedback({
		successDuration: 0,
	});
	const canWrite = useCanWrite();

	if (!canWrite) {
		return null;
	}

	const handleConfirm = wrap(
		async () => onDelete(),
		() => {
			handlers.close();
			router.refresh();
		},
	);

	return (
		<>
			<ActionIcon
				color="red"
				data-testid={testId}
				onClick={handlers.open}
				variant="subtle"
			>
				<IconTrash size={16} />
			</ActionIcon>
			<DeleteConfirmModal
				errorMessage={errorMessage}
				loading={status === 'submitting'}
				message={message}
				onClose={handlers.close}
				onConfirm={handleConfirm}
				opened={opened}
				title={title}
			/>
		</>
	);
};

export { DeleteItemButton };
