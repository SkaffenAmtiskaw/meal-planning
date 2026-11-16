// A planner's Calendar page path, like "/<planner>/calendar".
export const calendarPath = (plannerId: string) => `/${plannerId}/calendar`;

// A planner's Recipes page path, like "/<planner>/recipes".
export const recipesListPath = (plannerId: string) => `/${plannerId}/recipes`;

// A recipe's detail page path, like "/<planner>/recipes/<recipe>".
export const recipePath = (plannerId: string, recipeId: string) =>
	`${recipesListPath(plannerId)}/${recipeId}`;
