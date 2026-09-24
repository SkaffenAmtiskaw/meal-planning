import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MealCard } from '@/_components/Calendar/MealCard/MealCard';

import { MealCardWithDragHandle } from './MealCardWithDragHandle';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_components/Calendar/MealCard/MealCard', () => ({
	MealCard: vi.fn(({ event, renderActions }) => (
		<div data-testid="meal-card" data-event-name={event.name}>
			{renderActions}
		</div>
	)),
}));

vi.mock('./MealCardWithDragHandle.module.css', () => ({
	default: {
		dragHandle: 'dragHandle',
		dragHandleGrid: 'dragHandleGrid',
		dragHandleDot: 'dragHandleDot',
	},
}));

describe('MealCardWithDragHandle', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const baseEvent = {
		id: 'event-1',
		date: '2024-06-15',
		name: 'Grilled Salmon',
		borderColor: '#F5B47A',
		dishes: [],
	};

	it('renders six drag handle dots', () => {
		render(<MealCardWithDragHandle event={baseEvent} />);

		expect(screen.getAllByTestId('drag-handle-dot')).toHaveLength(6);
	});

	it('renders the MealCard with the event', () => {
		render(<MealCardWithDragHandle event={baseEvent} />);

		expect(
			screen.getByTestId('meal-card').getAttribute('data-event-name'),
		).toBe('Grilled Salmon');
	});

	it('passes renderDish to MealCard', () => {
		const renderDish = vi.fn(() => <span>Custom dish</span>);

		render(
			<MealCardWithDragHandle event={baseEvent} renderDish={renderDish} />,
		);

		expect(vi.mocked(MealCard)).toHaveBeenCalledWith(
			expect.objectContaining({ event: baseEvent, renderDish }),
			undefined,
		);
	});

	it('passes renderActions to MealCard when provided', () => {
		const renderActions = (
			<button type="button" data-testid="action-button">
				Action
			</button>
		);

		render(
			<MealCardWithDragHandle
				event={baseEvent}
				renderActions={renderActions}
			/>,
		);

		expect(screen.getByTestId('action-button')).toBeDefined();
	});
});
