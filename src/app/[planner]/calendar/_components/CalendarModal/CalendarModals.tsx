'use client';

import { useCalendarModal } from './CalendarModalContext';
import type {
	CalendarModalFrame,
	CalendarModalFrames,
	CalendarModalState,
	CalendarModalType,
} from './types';

import { AddMealModal } from '../AddMealModal/AddMealModal';
import { MealDetailModal } from '../MealDetailModal/MealDetailModal';
import { dataIfOpen } from './_utils/dataIfOpen';

/**
 * Each type's frame. A new modal adds its data to `CalendarModalData` in
 * `types.ts` and its frame here.
 */
const MODAL_FRAMES: CalendarModalFrames = {
	add_meal: AddMealModal,
	meal_detail: MealDetailModal,
};

const MODAL_TYPES = Object.keys(MODAL_FRAMES) as CalendarModalType[];

function ModalFrame<K extends CalendarModalType>({
	type,
	state,
	close,
	plannerId,
}: {
	type: K;
	state: CalendarModalState;
	close: () => void;
	plannerId: string;
}) {
	const Frame: CalendarModalFrame<K> = MODAL_FRAMES[type];

	return (
		<Frame data={dataIfOpen(state, type)} close={close} plannerId={plannerId} />
	);
}

/**
 * Renders every calendar modal's frame, each open while the provider's state
 * names its type. Frames stay mounted, so a modal can animate open.
 */
export function CalendarModals({ plannerId }: { plannerId: string }) {
	const { state, close } = useCalendarModal();

	return MODAL_TYPES.map((type) => (
		<ModalFrame
			key={type}
			type={type}
			state={state}
			close={close}
			plannerId={plannerId}
		/>
	));
}
