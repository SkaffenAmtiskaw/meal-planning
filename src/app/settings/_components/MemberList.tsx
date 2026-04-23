'use client';

import { useEffect, useState } from 'react';

import { Alert, Badge, Group, Stack, Text } from '@mantine/core';

import type { PlannerMember } from '@/_actions/planner/getPlannerMembers';
import { getPlannerMembers } from '@/_actions/planner/getPlannerMembers';

import { getAccessLevelColor } from '../_utils/getAccessLevelColor';

interface MemberListProps {
	plannerId: string;
}

export const MemberList = ({ plannerId }: MemberListProps) => {
	const [members, setMembers] = useState<PlannerMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchMembers = async () => {
			try {
				setLoading(true);
				setError(null);
				const result = await getPlannerMembers(plannerId);

				if ('ok' in result && !result.ok) {
					setError(result.error);
					setMembers([]);
				} else {
					setMembers(result as PlannerMember[]);
				}
			} catch {
				setError('Failed to load members');
				setMembers([]);
			} finally {
				setLoading(false);
			}
		};

		fetchMembers();
	}, [plannerId]);

	if (loading) {
		return <Text>Loading members...</Text>;
	}

	if (error) {
		return (
			<Alert color="red" data-testid="member-list-error">
				{error}
			</Alert>
		);
	}

	return (
		<Stack>
			{members.map((member) => (
				<Group key={member.email} justify="space-between">
					<div>
						<Text fw={500}>{member.name}</Text>
						<Text size="sm" c="dimmed">
							{member.email}
						</Text>
					</div>
					<Badge color={getAccessLevelColor(member.accessLevel)}>
						{member.accessLevel}
					</Badge>
				</Group>
			))}
		</Stack>
	);
};
