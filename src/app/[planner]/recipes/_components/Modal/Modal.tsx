import type { ReactNode } from 'react';

import { getSavedItem } from '@/_actions/library';
import type { PlannerInterface } from '@/_models/types';

import { BookmarkForm } from './BookmarkForm';
import { ModalWrapper } from './ModalWrapper';
import { RecipeForm } from './RecipeForm';
import type { RecipesModal } from './types';

type Props = {
	planner: PlannerInterface;
	item?: string;
	status?: 'add' | 'edit';
	type?: 'bookmark' | 'recipe';
};

type Content = { modal: RecipesModal; form: ReactNode };

const getContent = async ({
	item: itemId,
	planner,
	status,
	type,
}: Props): Promise<Content | null> => {
	const formProps = { plannerId: planner._id, tags: planner.tags };

	if (status === 'add') {
		if (type === 'bookmark') {
			return {
				modal: { status, type },
				form: <BookmarkForm {...formProps} />,
			};
		}
		if (type === 'recipe') {
			return { modal: { status, type }, form: <RecipeForm {...formProps} /> };
		}
	}

	if (status === 'edit' && itemId) {
		const item = await getSavedItem(planner._id, itemId);
		if (!item) return null;

		if (type === 'bookmark' && 'url' in item) {
			return {
				modal: { status, type, item },
				form: <BookmarkForm item={item} {...formProps} />,
			};
		}
		if (type === 'recipe' && !('url' in item)) {
			return {
				modal: { status, type, item },
				form: <RecipeForm item={item} {...formProps} />,
			};
		}
	}

	return null;
};

export const Modal = async (props: Props) => {
	const content = await getContent(props);
	if (!content) return null;

	return <ModalWrapper {...content.modal}>{content.form}</ModalWrapper>;
};
