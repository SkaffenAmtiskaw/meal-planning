import type { BookmarkInterface } from '@/_models/planner/bookmark';
import type { RecipeInterface } from '@/_models/planner/recipe';

import { BookmarkForm } from './BookmarkForm';
import { RecipeForm } from './RecipeForm';

type Props = {
	planner: string; // ObjectID
	item?: string; // ObjectID
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

export const ModalContent = ({ item, status, type }: Props) => {
	if (!status || !type) return null;

	const { getForm, getHeader } = CONTENT_TYPES[status][type];
};
