export const matchesId =
	(id: unknown) =>
	(item: { _id: unknown }): boolean =>
		String(item._id) === String(id);
