'use client';

import { useState } from 'react';

import { ActionIcon, Group } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';

import type { AccessLevel } from '@/_models/user';

import { AccessLevelEditor } from './AccessLevelEditor';
import { RemoveMemberButton } from './RemoveMemberButton';

interface MemberActionsProps {
	plannerId: string;
	memberEmail: string;
	memberName: string;
	currentAccessLevel: AccessLevel;
	availableLevels: AccessLevel[];
	onUpdate: () => void;
	onRemove: () => void;
	onError: (error: string) => void;
	hidden?: boolean;
}

export const MemberActions = ({
	plannerId,
	memberEmail,
	memberName,
	currentAccessLevel,
	availableLevels,
	onUpdate,
	onRemove,
	onError,
	hidden = false,
}: MemberActionsProps) => {
	const [isEditing, setIsEditing] = useState(false);

	const handleEditClick = () => {
		setIsEditing(true);
	};

	const handleSave = () => {
		setIsEditing(false);
		onUpdate();
	};

	const handleCancel = () => {
		setIsEditing(false);
	};

	if (isEditing) {
		return (
			<Group gap="xs" data-testid="member-actions-container">
				<AccessLevelEditor
					plannerId={plannerId}
					memberEmail={memberEmail}
					currentAccessLevel={currentAccessLevel}
					availableLevels={availableLevels}
					onSave={handleSave}
					onCancel={handleCancel}
					onError={onError}
				/>
			</Group>
		);
	}

	return (
		<div
			style={{
				width: 64,
				display: 'flex',
				gap: 4,
				justifyContent: 'flex-end',
				alignItems: 'center',
			}}
			data-testid="member-actions-container"
		>
			{!hidden && (
				<>
					<ActionIcon
						variant="subtle"
						onClick={handleEditClick}
						size="sm"
						data-testid="edit-access-level"
					>
						<IconPencil size={16} />
					</ActionIcon>
					<RemoveMemberButton
						plannerId={plannerId}
						memberEmail={memberEmail}
						memberName={memberName}
						onRemove={onRemove}
					/>
				</>
			)}
		</div>
	);
};
