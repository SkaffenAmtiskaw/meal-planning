// Compares two strings alphabetically, ignoring case and accents, for sorting by name.
export const compareIgnoringCase = (a: string, b: string): number =>
	a.localeCompare(b, undefined, { sensitivity: 'base' });
