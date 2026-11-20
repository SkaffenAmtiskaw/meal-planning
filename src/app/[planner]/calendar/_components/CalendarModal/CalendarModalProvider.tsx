'use client';

import { type ReactNode, useCallback, useState } from 'react';

import { CalendarModalContext } from './CalendarModalContext';
import type {
	CalendarModalData,
	CalendarModalFrame,
	CalendarModalFrames,
	CalendarModalState,
	CalendarModalType,
} from './types';

import { AddMealModal } from '../AddMealForm/AddMealModal';
import { dataIfOpen } from './_utils/dataIfOpen';

interface CalendarModalProviderProps {
	plannerId: string;
	children: ReactNode;
}

const MODAL_FRAMES: CalendarModalFrames = {
	add_meal: AddMealModal,
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

export function CalendarModalProvider({
	plannerId,
	children,
}: CalendarModalProviderProps) {
	const [state, setState] = useState<CalendarModalState>({
		type: null,
		data: null,
	});

	const open = useCallback(
		<T extends CalendarModalType>(type: T, data: CalendarModalData[T]) => {
			setState({ type, data } as CalendarModalState);
		},
		[],
	);

	const close = useCallback(() => {
		setState({ type: null, data: null });
	}, []);

	return (
		<CalendarModalContext.Provider value={{ state, open, close }}>
			{children}
			{MODAL_TYPES.map((type) => (
				<ModalFrame
					key={type}
					type={type}
					state={state}
					close={close}
					plannerId={plannerId}
				/>
			))}
		</CalendarModalContext.Provider>
	);
}
