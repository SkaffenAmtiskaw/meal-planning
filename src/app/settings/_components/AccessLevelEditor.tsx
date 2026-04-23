'use client';

import { useState } from 'react';

import { ActionIcon, Group, Select } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

import { updateMemberAccess } from '@/_actions/planner/updateMemberAccess';
import type { AccessLevel } from '@/_models/user';

interface AccessLevelEditorProps {
	plannerId: string;
	memberEmail: string;
	currentAccessLevel: AccessLevel;
	availableLevels: AccessLevel[];
	onSave: () => void;
	onCancel: () => void;
	onError: (error: string) => void;
}

export const AccessLevelEditor = ({
	plannerId,
	memberEmail,
	currentAccessLevel,
	availableLevels,
	onSave,
	onCancel,
	onError,
}: AccessLevelEditorProps) => {
	const [selectedLevel, setSelectedLevel] =
		useState<AccessLevel>(currentAccessLevel);

	const handleSave = async () => {
		if (selectedLevel === currentAccessLevel) {
			onCancel();
			return;
		}

		const result = await updateMemberAccess(
			plannerId,
			memberEmail,
			selectedLevel,
		);

		if (result.ok) {
			onSave();
		} else {
			setSelectedLevel(currentAccessLevel);
			onError(result.error);
			onCancel();
		}
	};

	const handleCancel = () => {
		setSelectedLevel(currentAccessLevel);
		onCancel();
	};

	return (
		<Group gap="xs" data-testid="access-level-editor">
			<Select
				data={availableLevels.map((level) => ({ value: level, label: level }))}
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
};
