import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useIsMobile } from '@/_hooks';

import { MealFormLayout } from './MealFormLayout';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

const parts = {
	alert: <div data-testid="alert" />,
	meal: <div data-testid="meal" />,
	dishes: <div data-testid="dishes" />,
	saved: <div data-testid="saved" />,
	footer: <div data-testid="footer-content" />,
};

// The DOM order is the Tab order, so each part must come after the one before it.
const expectInOrder = (testIds: string[]) => {
	const nodes = testIds.map((id) => screen.getByTestId(id));
	for (let i = 1; i < nodes.length; i++) {
		expect(
			nodes[i - 1].compareDocumentPosition(nodes[i]) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	}
};

describe('MealFormLayout', () => {
	it('orders the desktop columns Meal, Dishes, Saved recipes, then the footer', () => {
		render(<MealFormLayout {...parts} />);

		expectInOrder(['meal-column', 'dishes-column', 'saved-column', 'footer']);
	});

	it('orders a phone column the meal, then the dishes, with no Saved recipes column', () => {
		vi.mocked(useIsMobile).mockReturnValueOnce(true);
		render(<MealFormLayout {...parts} />);

		expectInOrder(['alert', 'meal-column', 'dishes-column', 'footer']);
		expect(screen.queryByTestId('saved-column')).toBeNull();
		expect(screen.queryByTestId('saved')).toBeNull();
	});
});
