export interface CalendarModalData {
	add_meal: { initialDate?: string };
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

export interface CalendarModalContextValue {
	state: CalendarModalState;
	open: <T extends CalendarModalType>(
		type: T,
		data: CalendarModalData[T],
	) => void;
	close: () => void;
}
