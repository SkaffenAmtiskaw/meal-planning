'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { Modal } from '@mantine/core';

import type { RecipesModal } from './types';

type Props = RecipesModal & { children: ReactNode };

const SIZES = { bookmark: 'md', recipe: 'xl' } as const;

const ADD_TITLES = {
	bookmark: 'Add New Bookmark',
	recipe: 'Add New Recipe',
} as const;

const getTitle = (modal: RecipesModal) =>
	modal.status === 'add' ? ADD_TITLES[modal.type] : `Update ${modal.item.name}`;

export const ModalWrapper = ({ children, ...modal }: Props) => {
	const router = useRouter();
	const pathname = usePathname();

	return (
		<Modal
			opened
			size={SIZES[modal.type]}
			title={getTitle(modal)}
			onClose={() => router.push(pathname)}
		>
			{children}
		</Modal>
	);
};
