'use client';

import { NavLink } from '@/_components/NavLink';

type PlannerItem = { id: string; name: string };

type Props = {
	currentId: string;
	planners: PlannerItem[];
};

export const PlannerSwitcher = ({ currentId, planners }: Props) => (
	<>
		{planners.map((planner) => (
			<NavLink
				key={planner.id}
				active={planner.id === currentId}
				href={`/${planner.id}/calendar`}
				label={planner.name}
				data-testid={`planner-switcher-item-${planner.id}`}
			/>
		))}
	</>
);
