'use client';

import type { DishSource } from '@/_actions/calendar/types';
import { PillButton } from '@/_components';
import { withoutProtocol } from '@/_utils/withoutProtocol';

import classes from './RecipeChip.module.css';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { savedItemName } from '../../_utils/savedItemName';
import { SourceMark } from '../SourceMark/SourceMark';

type Props = {
	source: DishSource | null;
	onTogglePanel: () => void;
	onStartLinking: () => void;
};

/**
 * Where a dish's recipe comes from: "Link recipe" while nothing is linked, the
 * saved recipe's name, or the reference without its protocol. A long label is
 * cut off, and shows in full on hover. Tapping "Link recipe" starts linking, and
 * tapping a filled chip opens or closes the row's panel.
 */
export const RecipeChip = ({
	source,
	onTogglePanel,
	onStartLinking,
}: Props) => {
	const savedItems = usePlannerSavedItems();

	if (!source) {
		return (
			<PillButton
				variant="dashed"
				className={classes.root}
				onClick={onStartLinking}
			>
				<SourceMark kind="none" />
				<span className={classes.label}>Link recipe</span>
			</PillButton>
		);
	}

	const fullLabel =
		source.kind === 'saved'
			? savedItemName(savedItems, source.savedId)
			: source.text;

	return (
		<PillButton
			className={classes.root}
			title={fullLabel}
			onClick={onTogglePanel}
		>
			<SourceMark kind={source.kind} />
			<span className={classes.label}>
				{source.kind === 'saved' ? fullLabel : withoutProtocol(fullLabel)}
			</span>
		</PillButton>
	);
};
