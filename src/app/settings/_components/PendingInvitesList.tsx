'use client';

import {
	Alert,
	Badge,
	Button,
	Group,
	Loader,
	Skeleton,
	Stack,
	Text,
} from '@mantine/core';
import { IconClock, IconX } from '@tabler/icons-react';

import { DateTime } from 'luxon';

import type { PendingInvite } from '@/_actions/sharing';
import { useTimeZone } from '@/_hooks';
import { isPastDate, isWithinHours } from '@/_utils/date';
import { formatDate } from '@/_utils/formatDate';

import type { InviteStatus } from '../_hooks/types';
import { getAccessLevelColor } from '../_utils/getAccessLevelColor';

interface PendingInvitesListProps {
	invites: PendingInvite[];
	loading: boolean;
	cancelStatus: InviteStatus;
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
	const timeZone = useTimeZone();
	// Draws the skeleton's hidden text at the date's width until the zone is known.
	const formatInZone = (isoDateTime: string) =>
		formatDate(
			DateTime.fromISO(isoDateTime, { zone: timeZone ?? 'UTC' }),
			'shortMonthDayYear',
		);

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
							<Skeleton
								visible={!timeZone}
								width="auto"
								data-testid="invited-date-skeleton"
							>
								<Text size="xs" c="dimmed">
									Invited {formatInZone(invite.invitedAt)}
								</Text>
							</Skeleton>
							<Group gap={4}>
								{(isWithinHours(invite.expiresAt) ||
									isPastDate(invite.expiresAt)) && <IconClock size={12} />}
								{isPastDate(invite.expiresAt) ? (
									<Text size="xs" component="span" c="red">
										Expired
									</Text>
								) : (
									<Skeleton
										visible={!timeZone}
										width="auto"
										data-testid="expires-date-skeleton"
									>
										<Text size="xs" component="span" c="dimmed">
											Expires {formatInZone(invite.expiresAt)}
										</Text>
									</Skeleton>
								)}
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
