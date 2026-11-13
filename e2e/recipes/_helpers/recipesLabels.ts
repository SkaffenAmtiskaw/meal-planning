import type { newObjectId } from '#factories/objectId';

type ObjectId = ReturnType<typeof newObjectId>;

// The edit button's test ID on every list item, recipe or bookmark, since it has no accessible name.
export const editButtonTestId = 'edit-button';

// The delete buttons' test IDs on a recipe's and a bookmark's list item, since they have no accessible name.
export const deleteRecipeButtonTestId = 'delete-button';
export const deleteBookmarkButtonTestId = 'delete-bookmark-button';

// A recipe's detail page path, like "/<planner>/recipes/<recipe>".
export const recipePath = (plannerId: ObjectId, recipeId: ObjectId) =>
	`/${plannerId}/recipes/${recipeId}`;
