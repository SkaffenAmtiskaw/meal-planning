import { Button, Group } from '@mantine/core';

import { SectionLabel } from '../../../SectionLabel/SectionLabel';

type Props = {
	title: string;
	// Given while any tag is selected, so Clear tags shows only then.
	onClearTags?: () => void;
};

// The phone list's title, with Clear tags at the far end of its line.
export const PhoneSavedListHeader = ({ title, onClearTags }: Props) => (
	// A long title wraps rather than pushing Clear tags onto a line of its own.
	<Group justify="space-between" wrap="nowrap" py="xs">
		<SectionLabel>{title}</SectionLabel>
		{onClearTags && (
			// Kept at its own width, so a wrapping title doesn't squeeze its label.
			<Button
				variant="subtle"
				size="compact-sm"
				flex="none"
				onClick={onClearTags}
			>
				Clear tags
			</Button>
		)}
	</Group>
);
