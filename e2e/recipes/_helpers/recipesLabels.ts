import type { newObjectId } from '#factories/objectId';

type ObjectId = ReturnType<typeof newObjectId>;

// A recipe's detail page path, like "/<planner>/recipes/<recipe>".
export const recipePath = (plannerId: ObjectId, recipeId: ObjectId) =>
	`/${plannerId}/recipes/${recipeId}`;
