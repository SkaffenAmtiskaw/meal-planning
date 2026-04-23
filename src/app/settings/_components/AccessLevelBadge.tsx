import { Badge } from '@mantine/core';

import type { AccessLevel } from '@/_models/user';

import { getAccessLevelColor } from '../_utils/getAccessLevelColor';

interface AccessLevelBadgeProps {
	accessLevel: AccessLevel;
}

export const AccessLevelBadge = ({ accessLevel }: AccessLevelBadgeProps) => {
	return (
		<Badge
			color={getAccessLevelColor(accessLevel)}
			data-testid="access-level-badge"
		>
			{accessLevel}
		</Badge>
	);
};
