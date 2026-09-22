'use client';

import { type ReactNode, useCallback, useState } from 'react';

import { Modal } from '@mantine/core';

import { useIsMobile } from '@/_hooks';

import {
	CalendarModalContext,
	type CalendarModalData,
	type CalendarModalState,
	type CalendarModalType,
} from './CalendarModalContext';

import { AddMealModal } from '../AddMealForm/AddMealModal';

export interface CalendarModalProviderProps {
	plannerId: string;
	children: ReactNode;
}

const MODAL_CONTENT: {
	[K in CalendarModalType]: React.FC<{
		data: CalendarModalData[K];
		close: () => void;
		plannerId: string;
	}>;
} = {
	add_meal: AddMealModal,
};

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

	const isMobile = useIsMobile();

	return (
		<CalendarModalContext.Provider value={{ state, open, close }}>
			{children}
			<Modal.Root
				opened={state.type !== null}
				onClose={close}
				size="xl"
				fullScreen={isMobile}
				radius={isMobile ? 0 : undefined}
				transitionProps={
					isMobile ? { transition: 'fade', duration: 200 } : undefined
				}
			>
				<Modal.Overlay />
				<ModalContent state={state} close={close} plannerId={plannerId} />
			</Modal.Root>
		</CalendarModalContext.Provider>
	);
}
