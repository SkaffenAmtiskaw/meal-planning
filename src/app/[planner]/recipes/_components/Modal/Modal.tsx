import type { Types } from 'mongoose';

import { getSavedItem } from '@/_actions';
import type { BookmarkInterface } from '@/_models/planner/bookmark';
import type { RecipeInterface } from '@/_models/planner/recipe';

import { BookmarkForm } from './BookmarkForm';
import { ModalWrapper } from './ModalWrapper';
import { RecipeForm } from './RecipeForm';

type Props = {
	planner: Types.ObjectId;
	item?: Types.ObjectId;
	status?: 'add' | 'edit';
	type?: 'bookmark' | 'recipe';
};

const CONTENT_TYPES = {
	add: {
		bookmark: {
			getForm: () => <BookmarkForm />,
			getHeader: () => 'Add New Bookmark',
		},
		recipe: {
			getForm: () => <RecipeForm />,
			getHeader: () => 'Add New Recipe',
		},
	},
	edit: {
		bookmark: {
			getForm: (bookmark: BookmarkInterface) => (
				<BookmarkForm item={bookmark} />
			),
			getHeader: ({ name }: BookmarkInterface) => `Update ${name}`,
		},
		recipe: {
			getForm: (recipe: RecipeInterface) => <RecipeForm item={recipe} />,
			getHeader: ({ name }: RecipeInterface) => `Update ${name}`,
		},
	},
};

export const Modal = async ({
	item: itemId,
	planner: plannerId,
	status,
	type,
}: Props) => {
	if (!status || !type) return null;

	if (status === 'edit' && itemId) {
		const item = await getSavedItem(plannerId, itemId);
		if (!item) return null;

		if (type === 'bookmark') {
			const { getForm, getHeader } = CONTENT_TYPES.edit.bookmark;
			return (
				<ModalWrapper opened title={getHeader(item as BookmarkInterface)}>
					{getForm(item as BookmarkInterface)}
				</ModalWrapper>
			);
		}

		if (type === 'recipe') {
			const { getForm, getHeader } = CONTENT_TYPES.edit.recipe;
			return (
				<ModalWrapper opened title={getHeader(item as RecipeInterface)}>
					{getForm(item as RecipeInterface)}
				</ModalWrapper>
			);
		}
	}

	if (status === 'add') {
		const { getForm, getHeader } = CONTENT_TYPES.add[type];

		return (
			<ModalWrapper opened title={getHeader()}>
				{getForm()}
			</ModalWrapper>
		);
	}

	return null;
};
