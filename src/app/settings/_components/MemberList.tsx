'use client';

import { Alert, Grid, Group, Stack, Text } from '@mantine/core';

import type { PlannerMember } from '@/_actions/planner/getPlannerMembers.types';

import { AccessLevelBadge } from './AccessLevelBadge';
import { MemberActions } from './MemberActions';

import { canModifyMember } from '../_utils/canModifyMember';
import { getAvailableAccessLevels } from '../_utils/getAvailableAccessLevels';

export interface MemberListProps {
	members: PlannerMember[];
	currentUserEmail: string | null;
	currentUserIsOwner: boolean;
	plannerId: string;
	onUpdate: () => void;
	onError: (errorMessage: string) => void;
	updateError: string | null;
}

export const MemberList = ({
	members,
	currentUserEmail,
	currentUserIsOwner,
	plannerId,
	onUpdate,
	onError,
	updateError,
}: MemberListProps) => {
	return (
		<Stack>
			{members.map((member) => (
				<Grid key={member.email} align="center">
					<Grid.Col span="auto">
						<Text fw={500}>{member.name}</Text>
						<Text size="sm" c="dimmed">
							{member.email}
						</Text>
					</Grid.Col>
					<Grid.Col span="content">
						<Group gap="xs">
							<AccessLevelBadge accessLevel={member.accessLevel} />
							<MemberActions
								plannerId={plannerId}
								memberEmail={member.email}
								memberName={member.name}
								currentAccessLevel={member.accessLevel}
								availableLevels={getAvailableAccessLevels(currentUserIsOwner)}
								onUpdate={onUpdate}
								onRemove={onUpdate}
								onError={onError}
								hidden={
									!canModifyMember({
										member,
										currentUserEmail,
										currentUserIsOwner,
									})
								}
							/>
						</Group>
					</Grid.Col>
				</Grid>
			))}
			{updateError && (
				<Alert color="red" data-testid="update-error" mt="sm">
					{updateError}
				</Alert>
			)}
		</Stack>
	);
};
