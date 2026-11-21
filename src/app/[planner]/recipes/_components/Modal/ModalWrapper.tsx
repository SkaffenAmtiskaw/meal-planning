'use client';

import { usePathname, useRouter } from 'next/navigation';

import { Modal } from '@mantine/core';

import { BookmarkForm } from './BookmarkForm';
import { RecipeForm } from './RecipeForm';
import type { RecipesModal } from './types';

import type { TagOption } from '../types';

type FormProps = {
	plannerId: string;
	tags: TagOption[];
	onCancel: () => void;
	onSuccess: () => void;
};

type Props = RecipesModal & Omit<FormProps, 'onCancel' | 'onSuccess'>;

const SIZES = { bookmark: 'md', recipe: 'xl' } as const;

const ADD_TITLES = {
	bookmark: 'Add New Bookmark',
	recipe: 'Add New Recipe',
} as const;

const getTitle = (modal: RecipesModal) =>
	modal.status === 'add' ? ADD_TITLES[modal.type] : `Update ${modal.item.name}`;

const renderForm = (modal: RecipesModal, formProps: FormProps) => {
	if (modal.type === 'bookmark') {
		const item = modal.status === 'edit' ? modal.item : undefined;
		return <BookmarkForm item={item} {...formProps} />;
	}

	const item = modal.status === 'edit' ? modal.item : undefined;
	return <RecipeForm item={item} {...formProps} />;
};

export const ModalWrapper = ({ plannerId, tags, ...modal }: Props) => {
	const router = useRouter();
	const pathname = usePathname();

	// Closing goes to the same page without the modal's search params.
	const close = () => router.push(pathname);

	return (
		<Modal
			opened
			size={SIZES[modal.type]}
			title={getTitle(modal)}
			onClose={close}
		>
			{renderForm(modal, {
				plannerId,
				tags,
				onCancel: close,
				onSuccess: close,
			})}
		</Modal>
	);
};
