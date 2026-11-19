export interface AddMealModalProps {
	data: { initialDate?: string };
	close: () => void;
	plannerId: string;
}

export type MealFormValues = {
	date: string;
	mealName: string;
	description: string;
};

export type SourceType = 'none' | 'saved' | 'text';

export type DishState = {
	id: string;
	name: string;
	sourceType: SourceType;
	savedId: string;
	sourceText: string;
	note: string;
	expanded: boolean;
};
