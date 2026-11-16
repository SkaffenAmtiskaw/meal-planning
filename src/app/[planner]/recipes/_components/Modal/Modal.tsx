import { getSavedItem } from '@/_actions/library';
import type {
	BookmarkInterface,
	PlannerInterface,
	RecipeInterface,
} from '@/_models/types';

import { BookmarkForm } from './BookmarkForm';
import { ModalWrapper } from './ModalWrapper';
import { RecipeForm } from './RecipeForm';

type Planner = PlannerInterface;

type Props = {
	planner: Planner;
	item?: string;
	status?: 'add' | 'edit';
	type?: 'bookmark' | 'recipe';
};

const CONTENT_TYPES = {
	add: {
		bookmark: {
			getForm: (planner: Planner) => (
				<BookmarkForm plannerId={planner._id} tags={planner.tags} />
			),
			getHeader: () => 'Add New Bookmark',
		},
		recipe: {
			getForm: (planner: Planner) => (
				<RecipeForm plannerId={planner._id} tags={planner.tags} />
			),
			getHeader: () => 'Add New Recipe',
		},
	},
	edit: {
		bookmark: {
			getForm: (planner: Planner, bookmark: BookmarkInterface) => (
				<BookmarkForm
					item={bookmark}
					plannerId={planner._id}
					tags={planner.tags}
				/>
			),
			getHeader: ({ name }: BookmarkInterface) => `Update ${name}`,
		},
		recipe: {
			getForm: (planner: Planner, recipe: RecipeInterface) => (
				<RecipeForm item={recipe} plannerId={planner._id} tags={planner.tags} />
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

		if (type === 'bookmark' && 'url' in item) {
			const { getForm, getHeader } = CONTENT_TYPES.edit.bookmark;
			return (
				<ModalWrapper opened title={getHeader(item)}>
					{getForm(planner, item)}
				</ModalWrapper>
			);
		}

		if (type === 'recipe' && !('url' in item)) {
			const { getForm, getHeader } = CONTENT_TYPES.edit.recipe;
			return (
				<ModalWrapper opened size="xl" title={getHeader(item)}>
					{getForm(planner, item)}
				</ModalWrapper>
			);
		}
	}

	if (status === 'add') {
		const { getForm, getHeader } = CONTENT_TYPES.add[type];

		return (
			<ModalWrapper
				opened
				size={type === 'recipe' ? 'xl' : 'md'}
				title={getHeader()}
			>
				{getForm(planner)}
			</ModalWrapper>
		);
	}

	return null;
};
