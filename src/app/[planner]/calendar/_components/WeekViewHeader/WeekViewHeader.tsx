import { ActionIcon, Button, Group } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import type { ViewType } from '../../_hooks/useViewType';
import { ViewSwitcher } from '../ViewSwitcher/ViewSwitcher';

type Props = {
	onPrev: () => void;
	onNext: () => void;
	onToday: () => void;
	viewType: ViewType;
	isMobile: boolean | undefined;
	onViewChange: (v: ViewType) => void;
};

export const WeekViewHeader = ({
	onPrev,
	onNext,
	onToday,
	viewType,
	isMobile,
	onViewChange,
}: Props) => (
	<Group justify="space-between" mb="sm" data-testid="week-view-header">
		<Group gap="xs">
			<ActionIcon
				variant="subtle"
				onClick={onPrev}
				data-testid="week-prev"
				aria-label="Previous week"
			>
				<IconChevronLeft size={16} />
			</ActionIcon>
			<Button
				variant="subtle"
				size="xs"
				onClick={onToday}
				data-testid="week-today"
			>
				Today
			</Button>
			<ActionIcon
				variant="subtle"
				onClick={onNext}
				data-testid="week-next"
				aria-label="Next week"
			>
				<IconChevronRight size={16} />
			</ActionIcon>
		</Group>
		<ViewSwitcher
			isMobile={isMobile}
			value={viewType}
			onChange={onViewChange}
		/>
	</Group>
);
