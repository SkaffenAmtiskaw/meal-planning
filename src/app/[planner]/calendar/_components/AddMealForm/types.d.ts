export type SourceType = 'none' | 'saved' | 'text';

export type DishState = {
	id: string;
	name: string;
	sourceType: SourceType;
	savedId: string;
	sourceText: string;
	note: string;
	noteExpanded: boolean;
};

export type MealFormValues = {
	date: string;
	mealName: string;
	description: string;
};
