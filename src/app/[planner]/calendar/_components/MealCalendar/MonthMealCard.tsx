import { Paper, Text } from '@mantine/core';

import { getMealColor, TAG_COLORS } from '@/_theme/colors';
import focusClasses from '@/_theme/focus.module.css';

interface MonthMealCardProps {
	meal: {
		id: string;
		name: string;
		description?: string;
	};
	onClick?: (meal: { id: string; name: string; description?: string }) => void;
	tabIndex?: number;
	ref?: React.Ref<HTMLButtonElement>;
}

export function MonthMealCard({
	meal,
	onClick,
	tabIndex,
	ref,
}: MonthMealCardProps) {
	const tagColor = getMealColor(meal.name);
	const { bg, text, border } = TAG_COLORS[tagColor];

	return (
		<Paper
			component="button"
			type="button"
			w="100%"
			p="xs"
			radius="md"
			ta="left"
			tabIndex={tabIndex}
			ref={ref}
			className={focusClasses.focusRing}
			style={{
				backgroundColor: bg,
				border: `1px solid ${border}`,
				cursor: 'pointer',
			}}
			onClick={() => onClick?.(meal)}
		>
			<Text fw={700} size="sm" truncate="end" c={text}>
				{meal.name}
			</Text>
			{meal.description && (
				<Text size="xs" truncate="end" c={text} style={{ opacity: 0.8 }}>
					{meal.description}
				</Text>
			)}
		</Paper>
	);
}
