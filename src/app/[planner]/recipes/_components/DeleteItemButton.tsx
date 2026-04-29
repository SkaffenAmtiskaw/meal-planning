'use client';

import { useRouter } from 'next/navigation';

import { ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { ConfirmButton } from '@/_components';
import type { ActionResult } from '@/_utils/actionResult';
import { useCanWrite } from '@/app/[planner]/_components';

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
	const canWrite = useCanWrite();

	if (!canWrite) {
		return null;
	}

	return (
		<ConfirmButton
			onConfirm={onDelete}
			onSuccess={() => router.refresh()}
			title={title}
			message={message}
			confirmButtonText="Delete"
			renderTrigger={(onOpen) => (
				<ActionIcon
					color="red"
					data-testid={testId}
					onClick={onOpen}
					variant="subtle"
				>
					<IconTrash size={16} />
				</ActionIcon>
			)}
		/>
	);
};

export { DeleteItemButton };
