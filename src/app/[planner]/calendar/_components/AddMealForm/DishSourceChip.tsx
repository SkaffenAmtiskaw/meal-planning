'use client';

import { BaseDishChip } from './BaseDishChip';
import type { SourceType } from './types';
import classes from './DishSourceChip.module.css';

type DishSourceChipProps = {
	label: string;
	title?: string;
	sourceType: SourceType;
	isEmpty: boolean;
	onClick: () => void;
	'data-testid': string;
};

export const DishSourceChip = ({
	label,
	title,
	sourceType,
	isEmpty,
	onClick,
	'data-testid': testId,
}: DishSourceChipProps) => {
	const dotClass =
		sourceType === 'saved'
			? classes.dotSaved
			: sourceType === 'text'
				? classes.dotText
				: classes.dotEmpty;

	return (
		<BaseDishChip
			isEmpty={isEmpty}
			onClick={onClick}
			data-testid={testId}
			title={title}
			className={classes.root}
		>
			<span className={`${classes.dot} ${dotClass}`} aria-hidden="true" />
			<span className={classes.label}>{label}</span>
		</BaseDishChip>
	);
};
