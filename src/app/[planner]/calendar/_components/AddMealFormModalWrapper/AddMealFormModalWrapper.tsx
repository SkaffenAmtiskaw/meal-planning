import type { SerializedDay } from '../../_utils/toScheduleXEvents';
import { AddMealForm } from '../AddMealForm/AddMealForm';

export interface AddMealFormModalWrapperProps {
	plannerId: string;
	initialDate?: string;
	onMealAdded?: (calendar: SerializedDay[]) => void;
	onClose: () => void;
}

export const AddMealFormModalWrapper = ({
	plannerId,
	initialDate,
	onMealAdded,
	onClose,
}: AddMealFormModalWrapperProps) => (
	<AddMealForm
		plannerId={plannerId}
		initialDate={initialDate}
		onCancel={onClose}
		onMealAdded={onMealAdded}
		onSuccess={() => onClose()}
	/>
);
