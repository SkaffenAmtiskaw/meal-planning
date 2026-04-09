import { Group } from '@mantine/core';

import type { ViewType } from '../../_hooks/useViewType';
import type { SerializedDay } from '../../_utils/toScheduleXEvents';
import { AddMealButton } from '../AddMealButton/AddMealButton';
import { ViewSwitcher } from '../ViewSwitcher/ViewSwitcher';

type Props = {
	plannerId: string;
	onMealAdded: (calendar: SerializedDay[]) => void;
	viewType: ViewType;
	isMobile: boolean | undefined;
	onViewChange: (v: ViewType) => void;
};

export const CalendarHeader = ({
	plannerId,
	onMealAdded,
	viewType,
	isMobile,
	onViewChange,
}: Props) => (
	<Group gap="xs">
		<AddMealButton plannerId={plannerId} onMealAdded={onMealAdded} />
		<ViewSwitcher
			isMobile={isMobile}
			value={viewType}
			onChange={onViewChange}
		/>
	</Group>
);
