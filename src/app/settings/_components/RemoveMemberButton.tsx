import { ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { removeMember } from '@/_actions/planner/removeMember';
import { ConfirmButton } from '@/_components';
import type { ActionResult } from '@/_utils/actionResult/ActionResult';

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
}) => (
	<ConfirmButton
		onConfirm={async (): Promise<ActionResult> => {
			const result = await removeMember(plannerId, memberEmail);
			if (result.ok) {
				return { ok: true, data: undefined };
			}
			return { ok: false, error: result.error ?? 'Failed to remove member' };
		}}
		onSuccess={onRemove}
		title={`Remove ${memberName}?`}
		message={`Are you sure you want to remove ${memberEmail} from this planner? This action cannot be undone.`}
		confirmButtonText="Remove"
		renderTrigger={(onOpen) => (
			<ActionIcon
				variant="subtle"
				color="red"
				onClick={onOpen}
				size="sm"
				data-testid="remove-member-button"
			>
				<IconTrash size={16} />
			</ActionIcon>
		)}
	/>
);
