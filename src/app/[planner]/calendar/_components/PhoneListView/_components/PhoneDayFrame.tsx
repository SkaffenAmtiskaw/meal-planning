import type { ReactElement, ReactNode, Ref } from 'react';

import { Stack } from '@mantine/core';

import styles from './PhoneDayFrame.module.css';

interface PhoneDayFrameProps {
	ref?: Ref<HTMLDivElement>;
	/** The day's full date, which names the section for screen readers. */
	ariaLabel?: string;
	header: ReactNode;
	children: ReactNode;
}

/**
 * The frame every phone list day sits in: its header, then its content. The
 * real days and their skeletons both draw through it, so a skeleton day takes
 * the same space as the day that replaces it.
 */
export function PhoneDayFrame({
	ref,
	ariaLabel,
	header,
	children,
}: PhoneDayFrameProps): ReactElement {
	return (
		<Stack
			ref={ref}
			component="section"
			aria-label={ariaLabel}
			className={styles.section}
			gap="xs"
			p="sm"
		>
			{header}
			{children}
		</Stack>
	);
}
