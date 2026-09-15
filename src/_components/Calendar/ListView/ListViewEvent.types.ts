export interface ListViewDish {
	name: string;
	source?: string | { url: string } | { ref: string } | { _id: string };
	note?: string;
}

export interface ListViewEvent {
	id: string;
	date: string;
	name: string;
	description?: string;
	borderColor: string;
	dishes: ListViewDish[];
}
