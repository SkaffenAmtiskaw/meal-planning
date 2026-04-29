'use client';

import {
	Alert,
	Badge,
	Button,
	Group,
	Loader,
	Stack,
	Text,
} from '@mantine/core';
import { IconClock, IconX } from '@tabler/icons-react';

import type { PendingInvite } from '@/_actions/planner/invite.types';
import { isPastDate, isWithinHours, toLocaleDateString } from '@/_utils/date';

import { getAccessLevelColor } from '../_utils/getAccessLevelColor';

export interface PendingInvitesListProps {
	invites: PendingInvite[];
	loading: boolean;
	cancelStatus: 'idle' | 'loading' | 'success' | 'error';
	cancelError: string | null;
	onCancel: (inviteId: string) => void;
}

export const PendingInvitesList = ({
	invites,
	loading,
	cancelStatus,
	cancelError,
	onCancel,
}: PendingInvitesListProps) => {
	if (loading) {
		return (
			<Group>
				<Loader size="sm" />
				<Text>Loading pending invites...</Text>
			</Group>
		);
	}

	if (invites.length === 0) {
		return <Text c="dimmed">No pending invites</Text>;
	}

	return (
		<Stack gap="md">
			{invites.map((invite) => (
				<Group key={invite.id} justify="space-between" align="center">
					<Stack gap={0}>
						<Text fw={500}>{invite.email}</Text>
						<Group gap="xs" mt={4}>
							<Badge size="sm" color={getAccessLevelColor(invite.accessLevel)}>
								{invite.accessLevel}
							</Badge>
							<Text size="xs" c="dimmed">
								Invited {toLocaleDateString(invite.invitedAt)}
							</Text>
							<Group gap={4}>
								{(isWithinHours(invite.expiresAt) ||
									isPastDate(invite.expiresAt)) && <IconClock size={12} />}
								<Text
									size="xs"
									component="span"
									c={isPastDate(invite.expiresAt) ? 'red' : 'dimmed'}
								>
									{isPastDate(invite.expiresAt)
										? 'Expired'
										: `Expires ${toLocaleDateString(invite.expiresAt)}`}
								</Text>
							</Group>
						</Group>
					</Stack>
					<Button
						variant="subtle"
						size="compact"
						color="red"
						disabled={cancelStatus === 'loading'}
						onClick={() => onCancel(invite.id)}
						data-testid={`cancel-button-${invite.id}`}
						aria-label={`Cancel invite to ${invite.email}`}
					>
						<IconX size={16} />
					</Button>
				</Group>
			))}
			{cancelStatus === 'error' && cancelError && (
				<Alert color="red" mt="sm">
					{cancelError}
				</Alert>
			)}
		</Stack>
	);
};
