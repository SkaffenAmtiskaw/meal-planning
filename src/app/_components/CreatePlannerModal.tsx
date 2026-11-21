'use client';

import { useRouter } from 'next/navigation';

import { Modal } from '@mantine/core';

import { CreatePlannerForm } from './CreatePlannerForm';

type Props = {
	opened: boolean;
	onClose: () => void;
};

/**
 * The New Planner modal. Its content unmounts when it closes, so the form
 * starts empty on each open.
 */
export const CreatePlannerModal = ({ opened, onClose }: Props) => {
	const router = useRouter();

	const handleSuccess = () => {
		onClose();
		router.refresh();
	};

	return (
		<Modal opened={opened} onClose={onClose} title="New Planner">
			<CreatePlannerForm onCancel={onClose} onSuccess={handleSuccess} />
		</Modal>
	);
};
