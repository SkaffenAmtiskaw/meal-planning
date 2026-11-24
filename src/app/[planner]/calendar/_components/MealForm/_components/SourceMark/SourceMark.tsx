import clsx from 'clsx';

import classes from './SourceMark.module.css';

// Where a dish's recipe comes from, as `DishSource`'s kinds name it, or 'none' when nothing is linked.
type SourceMarkKind = 'saved' | 'reference' | 'none';

/**
 * The mark that shows where a dish comes from: a filled green dot for a saved
 * recipe, a hollow green ring for a reference, a grey ring for nothing linked.
 * The text beside it says what it is, so it's hidden from screen readers.
 */
export const SourceMark = ({ kind }: { kind: SourceMarkKind }) => (
	<span className={clsx(classes.mark, classes[kind])} aria-hidden="true" />
);
