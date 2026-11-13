import type { newObjectId } from '#factories/objectId';

type ObjectId = ReturnType<typeof newObjectId>;

// A planner's Recipes page path, like "/<planner>/recipes".
export const recipesListPath = (plannerId: ObjectId) => `/${plannerId}/recipes`;

// A recipe's detail page path, like "/<planner>/recipes/<recipe>".
export const recipePath = (plannerId: ObjectId, recipeId: ObjectId) =>
	`${recipesListPath(plannerId)}/${recipeId}`;
