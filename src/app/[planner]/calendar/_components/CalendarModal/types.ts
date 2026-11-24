import type { ComponentType } from 'react';

import type { AddMealModalData } from '../AddMealModal/types';
import type { MealDetailModalData } from '../MealDetailModal/types';

export interface CalendarModalData {
	add_meal: AddMealModalData;
	meal_detail: MealDetailModalData;
}

export type CalendarModalType = keyof CalendarModalData;

export type CalendarModalState =
	| { type: null; data: null }
	| {
			[K in CalendarModalType]: {
				type: K;
				data: CalendarModalData[K];
			};
	  }[CalendarModalType];

/**
 * Props the provider gives each type's frame. The frame stays mounted, so its
 * modal can animate open, and is open while `data` isn't null.
 */
export interface CalendarModalFrameProps<K extends CalendarModalType> {
	data: CalendarModalData[K] | null;
	close: () => void;
	plannerId: string;
}

/** The component that renders the whole modal for one type. */
export type CalendarModalFrame<K extends CalendarModalType> = ComponentType<
	CalendarModalFrameProps<K>
>;

/** Each type's frame. */
export type CalendarModalFrames = {
	[K in CalendarModalType]: CalendarModalFrame<K>;
};
