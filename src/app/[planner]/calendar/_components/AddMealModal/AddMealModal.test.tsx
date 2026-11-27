import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Modal } from '@mantine/core';

import { useEscapeLayers, useIsMobile } from '@/_hooks';

import { AddMealModal } from './AddMealModal';

import { AddMealModalContent } from './_components/AddMealModalContent/AddMealModalContent';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('./_components/AddMealModalContent/AddMealModalContent', () => ({
	AddMealModalContent: vi.fn(() => <div data-testid="add-meal-content" />),
}));

const rootProps = () => vi.mocked(Modal.Root).mock.lastCall?.[0];
const content = () => screen.queryByTestId('add-meal-content');

const props = { data: {}, close: vi.fn(), plannerId: 'planner-1' };

describe('AddMealModal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('is closed and shows nothing while it has no data', () => {
		render(<AddMealModal {...props} data={null} />);

		expect(rootProps()?.opened).toBe(false);
		expect(content()).toBeNull();
	});

	it('opens with its content on the date it was opened with', () => {
		render(<AddMealModal {...props} data={{ initialDate: '2026-11-27' }} />);

		expect(rootProps()?.opened).toBe(true);
		expect(vi.mocked(AddMealModalContent)).toHaveBeenLastCalledWith(
			{ initialDate: '2026-11-27', plannerId: 'planner-1', close: props.close },
			undefined,
		);
	});

	it('takes its content away on close, so the next open starts afresh', () => {
		const { rerender } = render(<AddMealModal {...props} />);
		const first = content();

		rerender(<AddMealModal {...props} data={null} />);
		expect(content()).toBeNull();

		rerender(<AddMealModal {...props} data={{ initialDate: '2026-11-29' }} />);
		expect(content()).not.toBe(first);
	});

	it('closes on Esc while no layer inside is open', () => {
		render(<AddMealModal {...props} />);

		expect(rootProps()?.closeOnEscape).toBe(true);
	});

	it('leaves Esc to a layer open inside it, such as a picker or link mode', () => {
		vi.mocked(useEscapeLayers).mockReturnValueOnce({
			anyOpen: true,
			register: vi.fn(),
		});

		render(<AddMealModal {...props} />);

		expect(rootProps()?.closeOnEscape).toBe(false);
	});

	it.each([
		true,
		false,
	])('fills the screen only on a phone (%s)', (isMobile) => {
		vi.mocked(useIsMobile).mockReturnValueOnce(isMobile);
		render(<AddMealModal {...props} />);

		expect(rootProps()?.fullScreen).toBe(isMobile);
	});
});
