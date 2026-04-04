import styles from './MonthGridEvent.module.css';

type Props = {
	calendarEvent: {
		title?: string;
		description?: string;
	};
};

export const MonthGridEvent = ({ calendarEvent }: Props) => (
	<div className={styles.event}>
		<p className={styles.title}>{calendarEvent.title}</p>
		{calendarEvent.description && (
			<p className={styles.description}>{calendarEvent.description}</p>
		)}
	</div>
);
