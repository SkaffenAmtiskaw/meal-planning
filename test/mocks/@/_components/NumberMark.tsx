import type { AriaAttributes, ReactNode } from 'react';

/**
 * Stands in for `NumberMark` when a test mocks `@/_components`, so a caller's test checks which
 * marks it asks for rather than how `NumberMark` draws them.
 */
export function NumberMark({
	children,
	ring = false,
	filled = false,
	muted = false,
	size,
	...ariaProps
}: AriaAttributes & {
	children: ReactNode;
	ring?: boolean;
	filled?: boolean;
	muted?: boolean;
	size?: string;
}) {
	return (
		<span
			data-testid={`number-mark-${children}`}
			data-ring={String(ring)}
			data-filled={String(filled)}
			data-muted={String(muted)}
			data-size={size}
			{...ariaProps}
		>
			{children}
		</span>
	);
}
