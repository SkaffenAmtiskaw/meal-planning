'use client';

import { useCallback } from 'react';

import { useDisclosure } from '@mantine/hooks';

import { ConfirmModal } from '@/_components';
import { useAsyncStatus } from '@/_hooks';
import type { ActionResult } from '@/_utils/actionResult/ActionResult';

export interface ConfirmButtonProps {
	onConfirm: () => Promise<ActionResult>;
	onSuccess?: () => void;
	onError?: (error: string) => void;
	title: string;
	message: React.ReactNode;
	confirmButtonText?: string;
	renderTrigger: (onOpen: () => void) => React.ReactNode;
}

export const ConfirmButton = ({
	onConfirm,
	onSuccess,
	onError,
	title,
	message,
	confirmButtonText = 'Confirm',
	renderTrigger,
}: ConfirmButtonProps) => {
	const [opened, { open, close }] = useDisclosure(false);
	const { status, error, run, reset } = useAsyncStatus();

	const handleConfirm = useCallback(async () => {
		const result = await run(onConfirm);

		if (result?.ok) {
			onSuccess?.();
			close();
		} else if (result && !result.ok) {
			onError?.(result.error);
		}
	}, [onConfirm, onSuccess, onError, run, close]);

	const handleClose = useCallback(() => {
		close();
		reset();
	}, [close, reset]);

	const isLoading = status === 'loading';

	return (
		<>
			{renderTrigger(open)}
			<ConfirmModal
				opened={opened}
				onClose={handleClose}
				onConfirm={handleConfirm}
				loading={isLoading}
				errorMessage={error || undefined}
				title={title}
				message={message}
				confirmButtonText={confirmButtonText}
			/>
		</>
	);
};
