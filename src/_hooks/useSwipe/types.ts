export type SwipeDirection = 'left' | 'right' | 'down';

export type UseSwipeOptions = {
	// Called with the direction of each finished swipe.
	onSwipe: (direction: SwipeDirection) => void;
	// Whether swipes are reported. On by default.
	enabled?: boolean;
};
