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
