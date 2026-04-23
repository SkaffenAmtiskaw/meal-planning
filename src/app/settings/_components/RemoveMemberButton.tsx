'use client';

import { ActionIcon, Button, Group, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';

import { useRemoveMember } from '../_hooks/useRemoveMember';

interface RemoveMemberButtonProps {
	plannerId: string;
	memberEmail: string;
	memberName: string;
	onRemove: () => void;
}

export const RemoveMemberButton: React.FC<RemoveMemberButtonProps> = ({
	plannerId,
	memberEmail,
	memberName,
	onRemove,
}) => {
	const [opened, { open, close }] = useDisclosure(false);
	const { remove, isLoading } = useRemoveMember(plannerId, memberEmail);

	const handleConfirm = async () => {
		const success = await remove();

		if (success) {
			onRemove();
			close();
		}
	};

	const handleCancel = () => {
		close();
	};

	return (
		<>
			<ActionIcon
				variant="subtle"
				color="red"
				onClick={open}
				size="sm"
				data-testid="remove-member-button"
			>
				<IconTrash size={16} />
			</ActionIcon>

			<Modal
				opened={opened}
				onClose={close}
				title={`Remove ${memberName}?`}
				data-testid="remove-member-modal"
			>
				<Text mb="md">
					Are you sure you want to remove {memberEmail} from this planner? This
					action cannot be undone.
				</Text>
				<Group justify="flex-end">
					<Button
						variant="default"
						onClick={handleCancel}
						data-testid="cancel-remove-button"
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						color="red"
						onClick={handleConfirm}
						loading={isLoading}
						data-testid="confirm-remove-button"
					>
						Remove
					</Button>
				</Group>
			</Modal>
		</>
	);
};
