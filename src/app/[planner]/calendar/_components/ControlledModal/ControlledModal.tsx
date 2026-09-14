'use client';

import type { ReactElement, ReactNode } from 'react';

import { Modal, type ModalProps } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export interface ControlledModalProps {
	trigger: (props: { onOpen: () => void }) => ReactElement;
	children: (props: { onClose: () => void }) => ReactNode;
	modalProps?: Omit<ModalProps, 'opened' | 'onClose'>;
}

export function ControlledModal({
	trigger,
	children,
	modalProps,
}: ControlledModalProps): ReactElement {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<>
			{trigger({ onOpen: open })}
			<Modal opened={opened} onClose={close} {...modalProps}>
				{children({ onClose: close })}
			</Modal>
		</>
	);
}
