'use client';

import type { ModalProps } from '@mantine/core';
import { Modal as BaseModal } from '@mantine/core';

import { usePathname, useRouter } from 'next/navigation';

import type { Optionalize } from '@/_utils/types';

type Props = Optionalize<ModalProps, 'onClose'>;

export const Modal = ({ onClose, ...props }: Props) => {
	const router = useRouter();
	const pathname = usePathname();

	const handleClose = () => {
		if (onClose) {
			onClose();
		}

		router.push(pathname);
	};

	return <BaseModal {...props} onClose={handleClose} />;
};
