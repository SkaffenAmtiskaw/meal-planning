'use client';

import { PillButton } from '@/_components';

type Props = {
	hasNote: boolean;
	onTogglePanel: () => void;
};

// "Add note", dashed, until the dish has a note, then "Note". Opens or closes the row's panel.
export const NoteChip = ({ hasNote, onTogglePanel }: Props) => (
	<PillButton variant={hasNote ? 'outline' : 'dashed'} onClick={onTogglePanel}>
		{hasNote ? 'Note' : 'Add note'}
	</PillButton>
);
