export interface MobileMonthGridEvent {
	id: string;
	date: string; // ISO date YYYY-MM-DD
	color: string; // tag-color border value to use for the dot
}

export interface MobileMonthGridProps {
	events?: MobileMonthGridEvent[];
}
