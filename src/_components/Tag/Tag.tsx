import { Badge } from '@mantine/core';

import { TAG_COLORS } from '@/_theme/colors';
import type { TagColor } from '@/_theme/types';

type Props = {
	color: TagColor;
	children: React.ReactNode;
	className?: string;
};

export const Tag = ({ color, children, className }: Props) => {
	const { bg, text, border } = TAG_COLORS[color];

	return (
		<Badge
			className={className}
			style={{
				backgroundColor: bg,
				color: text,
				border: `1px solid ${border}`,
			}}
			variant="light"
		>
			{children}
		</Badge>
	);
};
