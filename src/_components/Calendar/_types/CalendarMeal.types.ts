export interface CalendarDish {
	name: string;
	source?: string | { url: string } | { ref: string } | { _id: string };
	note?: string;
}

export interface CalendarMeal {
	id: string;
	date: string;
	name: string;
	description?: string;
	borderColor: string;
	dishes: CalendarDish[];
}
