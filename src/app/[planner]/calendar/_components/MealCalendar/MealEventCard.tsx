import { Paper, Text } from '@mantine/core';

import { getMealColor, TAG_COLORS } from '@/_theme/colors';

export interface MealEventCardProps {
	event: {
		id: string;
		title: string;
		description?: string;
	};
	onClick?: (event: {
		id: string;
		title: string;
		description?: string;
	}) => void;
}

export function MealEventCard({ event, onClick }: MealEventCardProps) {
	const tagColor = getMealColor(event.title);
	const { bg, text, border } = TAG_COLORS[tagColor];

	return (
		<Paper
			component="button"
			type="button"
			w="100%"
			p="xs"
			radius="md"
			ta="left"
			style={{
				backgroundColor: bg,
				border: `1px solid ${border}`,
				cursor: 'pointer',
			}}
			onClick={() => onClick?.(event)}
		>
			<Text fw={700} size="sm" truncate="end" c={text}>
				{event.title}
			</Text>
			{event.description && (
				<Text size="xs" truncate="end" c={text} style={{ opacity: 0.8 }}>
					{event.description}
				</Text>
			)}
		</Paper>
	);
}
