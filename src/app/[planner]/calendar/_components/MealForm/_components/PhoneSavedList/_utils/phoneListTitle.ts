/**
 * The phone list's title, which names the selected tags in pick order while
 * any are selected. It takes an object so the title can grow other inputs.
 * SectionLabel shows it in capitals.
 */
export const phoneListTitle = ({
	selectedTagNames,
}: {
	selectedTagNames: string[];
}): string =>
	selectedTagNames.length > 0
		? `Saved · ${selectedTagNames.join(' + ')}`
		: 'From your saved recipes';
