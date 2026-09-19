'use client';

import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';

import { AddMealForm } from '../AddMealForm/AddMealForm';

export interface AddMealFormModalWrapperProps {
	plannerId: string;
	initialDate?: string;
	onClose: () => void;
}

export const AddMealFormModalWrapper = ({
	plannerId,
	initialDate,
	onClose,
}: AddMealFormModalWrapperProps): ReactElement => {
	const router = useRouter();

	return (
		<AddMealForm
			plannerId={plannerId}
			initialDate={initialDate}
			onCancel={onClose}
			onSuccess={() => {
				onClose();
				router.refresh();
			}}
		/>
	);
};
