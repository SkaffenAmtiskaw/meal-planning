'use client';

import { deleteRecipe } from '@/_actions/saved';

import { DeleteItemButton } from './DeleteItemButton';

type Props = {
	plannerId: string;
	recipeId: string;
};

const DeleteRecipeButton = ({ plannerId, recipeId }: Props) => (
	<DeleteItemButton
		data-testid="delete-button"
		message="Are you sure you want to delete this recipe? This cannot be undone."
		onDelete={() => deleteRecipe({ plannerId, recipeId })}
		title="Delete Recipe"
	/>
);

export { DeleteRecipeButton };
