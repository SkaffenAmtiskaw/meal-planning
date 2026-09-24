'use client';

import { BaseDishChip } from './BaseDishChip';

type DishNoteChipProps = {
	note: string;
	onClick: () => void;
	'data-testid': string;
};

export const DishNoteChip = ({
	note,
	onClick,
	'data-testid': testId,
}: DishNoteChipProps) => {
	const isEmpty = note === '';

	return (
		<BaseDishChip isEmpty={isEmpty} onClick={onClick} data-testid={testId}>
			{isEmpty ? 'Add note' : 'Note'}
		</BaseDishChip>
	);
};
