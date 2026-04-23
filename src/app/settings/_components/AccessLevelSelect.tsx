'use client';

import { useState } from 'react';

import { ActionIcon, Badge, Group, Select } from '@mantine/core';
import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';

import { updateMemberAccess } from '@/_actions/planner/updateMemberAccess';
import type { AccessLevel } from '@/_models/user';

import { getAccessLevelColor } from '../_utils/getAccessLevelColor';

interface AccessLevelSelectProps {
	plannerId: string;
	memberEmail: string;
	currentAccessLevel: AccessLevel;
	viewerIsOwner: boolean;
	onUpdate: () => void;
	onError: (error: string) => void;
	hidden?: boolean;
}

export const AccessLevelSelect = ({
	plannerId,
	memberEmail,
	currentAccessLevel,
	viewerIsOwner,
	onUpdate,
	onError,
	hidden = false,
}: AccessLevelSelectProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [selectedLevel, setSelectedLevel] =
		useState<AccessLevel>(currentAccessLevel);

	// Determine available options based on viewer's role
	const getOptions = () => {
		if (viewerIsOwner) {
			return ['admin', 'write', 'read'] as AccessLevel[];
		}
		// Admin can only assign write/read
		return ['write', 'read'] as AccessLevel[];
	};

	const handleSave = async () => {
		// Optimistic update - immediately reflect change
		const previousLevel = currentAccessLevel;

		if (selectedLevel === previousLevel) {
			setIsEditing(false);
			return;
		}

		const result = await updateMemberAccess(
			plannerId,
			memberEmail,
			selectedLevel,
		);

		if (result.ok) {
			setIsEditing(false);
			onUpdate();
		} else {
			// Revert on error
			setSelectedLevel(previousLevel);
			onError(result.error);
			setIsEditing(false);
		}
	};

	const handleCancel = () => {
		setSelectedLevel(currentAccessLevel);
		setIsEditing(false);
	};

	if (isEditing) {
		return (
			<Group gap="xs">
				<Select
					data={getOptions().map((level) => ({ value: level, label: level }))}
					value={selectedLevel}
					onChange={(value) => setSelectedLevel(value as AccessLevel)}
					size="xs"
					data-testid="access-level-select"
				/>
				<ActionIcon
					color="green"
					onClick={handleSave}
					size="sm"
					data-testid="save-access-level"
				>
					<IconCheck size={16} />
				</ActionIcon>
				<ActionIcon
					color="red"
					onClick={handleCancel}
					size="sm"
					data-testid="cancel-access-level"
				>
					<IconX size={16} />
				</ActionIcon>
			</Group>
		);
	}

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'flex-end',
				alignItems: 'center',
				gap: '8px',
			}}
		>
			<Badge
				color={getAccessLevelColor(currentAccessLevel)}
				data-testid="access-level-badge"
			>
				{currentAccessLevel}
			</Badge>
			<div
				style={{
					width: 32,
					height: 32,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{!hidden && (
					<ActionIcon
						variant="subtle"
						onClick={() => setIsEditing(true)}
						size="sm"
						data-testid="edit-access-level"
					>
						<IconPencil size={16} />
					</ActionIcon>
				)}
			</div>
		</div>
	);
};
