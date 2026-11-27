'use client';

import { Modal } from '@mantine/core';

import { EscapeLayersProvider, useEscapeLayers, useIsMobile } from '@/_hooks';

import type { CalendarModalFrameProps } from '../CalendarModal/types';
import { AddMealModalContent } from './_components/AddMealModalContent/AddMealModalContent';

/**
 * The Add Meal frame: a wide modal on desktop, and a full-screen sheet on a
 * phone. It stays on the page so it can animate open. What it shows while
 * open is AddMealModalContent, which starts afresh on each open.
 */
export function AddMealModal({
	data,
	close,
	plannerId,
}: CalendarModalFrameProps<'add_meal'>) {
	const isMobile = useIsMobile();
	const escapeLayers = useEscapeLayers();

	return (
		<Modal.Root
			opened={data !== null}
			onClose={close}
			size={1180}
			fullScreen={isMobile}
			radius={isMobile ? 0 : undefined}
			// A picker or link mode inside takes Esc first, so one Esc closes only that layer.
			closeOnEscape={!escapeLayers.anyOpen}
			transitionProps={
				isMobile ? { transition: 'fade', duration: 200 } : undefined
			}
		>
			<EscapeLayersProvider value={escapeLayers.register}>
				<Modal.Overlay />
				{data !== null && (
					<AddMealModalContent
						initialDate={data.initialDate}
						plannerId={plannerId}
						close={close}
					/>
				)}
			</EscapeLayersProvider>
		</Modal.Root>
	);
}
