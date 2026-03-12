import type { HydratedDocument, Types } from 'mongoose';

import { getSavedItem } from '@/_actions';
import type { PlannerInterface } from '@/_models/planner';
import type { BookmarkInterface } from '@/_models/planner/bookmark';
import type { RecipeInterface } from '@/_models/planner/recipe';

import { BookmarkForm } from './BookmarkForm';
import { ModalWrapper } from './ModalWrapper';
import { RecipeForm } from './RecipeForm';

type Planner = HydratedDocument<PlannerInterface>;

type Props = {
	planner: Planner;
	item?: Types.ObjectId;
	status?: 'add' | 'edit';
	type?: 'bookmark' | 'recipe';
};

const CONTENT_TYPES = {
	add: {
		bookmark: {
			getForm: (planner: Planner) => <BookmarkForm planner={planner} />,
			getHeader: () => 'Add New Bookmark',
		},
		recipe: {
			getForm: (planner: Planner) => <RecipeForm planner={planner} />,
			getHeader: () => 'Add New Recipe',
		},
	},
	edit: {
		bookmark: {
			getForm: (planner: Planner, bookmark: BookmarkInterface) => (
				<BookmarkForm item={bookmark} planner={planner} />
			),
			getHeader: ({ name }: BookmarkInterface) => `Update ${name}`,
		},
		recipe: {
			getForm: (planner: Planner, recipe: RecipeInterface) => (
				<RecipeForm item={recipe} planner={planner} />
			),
			getHeader: ({ name }: RecipeInterface) => `Update ${name}`,
		},
	},
};

export const Modal = async ({ item: itemId, planner, status, type }: Props) => {
	if (!status || !type) return null;

	if (status === 'edit' && itemId) {
		const item = await getSavedItem(planner._id, itemId);
		if (!item) return null;

		if (type === 'bookmark') {
			const { getForm, getHeader } = CONTENT_TYPES.edit.bookmark;
			return (
				<ModalWrapper opened title={getHeader(item as BookmarkInterface)}>
					{getForm(planner, item as BookmarkInterface)}
				</ModalWrapper>
			);
		}

		if (type === 'recipe') {
			const { getForm, getHeader } = CONTENT_TYPES.edit.recipe;
			return (
				<ModalWrapper opened title={getHeader(item as RecipeInterface)}>
					{getForm(planner, item as RecipeInterface)}
				</ModalWrapper>
			);
		}
	}

	if (status === 'add') {
		const { getForm, getHeader } = CONTENT_TYPES.add[type];

		return (
			<ModalWrapper opened title={getHeader()}>
				{getForm(planner)}
			</ModalWrapper>
		);
	}

	return null;
};
