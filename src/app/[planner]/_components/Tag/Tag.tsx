import type { ReactNode } from 'react';

import { Badge } from '@mantine/core';

import type { TagColor } from '@/_theme/types';

type Props = {
	color: TagColor;
	children: ReactNode;
	className?: string;
	// Smaller, without a border and not in capitals, for the row of tags under each item in a list.
	compact?: boolean;
};

// A tag's badge, in the tag's own color from the tag palette.
export const Tag = ({ color, children, className, compact = false }: Props) => (
	<Badge
		className={className}
		color={color}
		variant={compact ? 'tag-plain' : 'tag'}
		size={compact ? 'sm' : 'md'}
		// The design writes a compact tag's name as it was typed, where a full tag is all capitals.
		tt={compact ? 'none' : undefined}
	>
		{children}
	</Badge>
);
