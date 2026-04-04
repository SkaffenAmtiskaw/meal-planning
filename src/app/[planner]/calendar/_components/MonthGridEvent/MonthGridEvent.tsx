import { Card, Text } from '@mantine/core';

import styles from './MonthGridEvent.module.css';

type Props = {
	calendarEvent: {
		title?: string;
		description?: string;
	};
};

export const MonthGridEvent = ({ calendarEvent }: Props) => (
	<Card className={styles.event}>
		<Text className={styles.title} fw={700} size="sm">
			{calendarEvent.title}
		</Text>
		{calendarEvent.description && (
			<Text className={styles.description} size="sm">
				{calendarEvent.description}
			</Text>
		)}
	</Card>
);
