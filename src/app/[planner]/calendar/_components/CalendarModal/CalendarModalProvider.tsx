'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useCallback, useState } from 'react';

import { Modal } from '@mantine/core';

import {
	CalendarModalContext,
	type CalendarModalData,
	type CalendarModalState,
	type CalendarModalType,
} from './CalendarModalContext';

import { AddMealForm } from '../AddMealForm/AddMealForm';

export interface CalendarModalProviderProps {
	plannerId: string;
	children: ReactNode;
}

const MODAL_TITLES: Record<CalendarModalType, string> = {
	add_meal: 'Add Meal',
};

const MODAL_CONTENT: {
	[K in CalendarModalType]: React.FC<{
		data: CalendarModalData[K];
		close: () => void;
		plannerId: string;
	}>;
} = {
	add_meal: AddMealModalContent,
};

function AddMealModalContent({
	data,
	close,
	plannerId,
}: {
	data: CalendarModalData['add_meal'];
	close: () => void;
	plannerId: string;
}) {
	const router = useRouter();

	return (
		<AddMealForm
			plannerId={plannerId}
			initialDate={data.initialDate}
			onCancel={close}
			onSuccess={() => {
				close();
				router.refresh();
			}}
		/>
	);
}

function ModalContent({
	state,
	close,
	plannerId,
}: {
	state: CalendarModalState;
	close: () => void;
	plannerId: string;
}) {
	if (state.type === null) return null;

	const Content = MODAL_CONTENT[state.type];
	return <Content data={state.data} close={close} plannerId={plannerId} />;
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
			<Modal
				opened={state.type !== null}
				onClose={close}
				title={state.type ? MODAL_TITLES[state.type] : ''}
				size="lg"
			>
				<ModalContent state={state} close={close} plannerId={plannerId} />
			</Modal>
		</CalendarModalContext.Provider>
	);
}
