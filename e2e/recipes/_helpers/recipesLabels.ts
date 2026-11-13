import type { newObjectId } from '#factories/objectId';

type ObjectId = ReturnType<typeof newObjectId>;

// The edit button's test ID on every list item, recipe or bookmark, since it has no accessible name.
export const editButtonTestId = 'edit-button';

// A recipe's detail page path, like "/<planner>/recipes/<recipe>".
export const recipePath = (plannerId: ObjectId, recipeId: ObjectId) =>
	`/${plannerId}/recipes/${recipeId}`;
