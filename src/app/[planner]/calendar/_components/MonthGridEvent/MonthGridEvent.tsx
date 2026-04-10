import { Card, Text } from '@mantine/core';

import { getMealColor, TAG_COLORS } from '@/_theme/colors';

import styles from './MonthGridEvent.module.css';

type Props = {
	calendarEvent: {
		title?: string;
		description?: string;
	};
};

export const MonthGridEvent = ({ calendarEvent }: Props) => {
	const tagColor = getMealColor(calendarEvent.title ?? '');
	const { bg, text, border } = TAG_COLORS[tagColor];

	return (
		<Card
			className={styles.event}
			style={{
				backgroundColor: bg,
				color: text,
				border: `1px solid ${border}`,
			}}
			p="xs"
		>
			<Text className={styles.title} fw={700} size="sm" style={{ color: text }}>
				{calendarEvent.title}
			</Text>
			{calendarEvent.description && (
				<Text className={styles.description} size="xs" style={{ color: text }}>
					{calendarEvent.description}
				</Text>
			)}
		</Card>
	);
};
