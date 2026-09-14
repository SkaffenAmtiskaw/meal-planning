export interface ListViewEvent<Dish = unknown> {
	id: string;
	date: string;
	name: string;
	description?: string;
	borderColor: string;
	dishes: Dish[];
}
