import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDisclosure } from '@mantine/hooks';

import { ConfirmModal } from '@/_components';

import { DeleteDishButton } from './DeleteDishButton';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('#mocks/@mantine/hooks'));
vi.mock('@/_components', () => ({
	ConfirmModal: vi.fn(() => null),
}));

const disclosure = {
	open: vi.fn(),
	close: vi.fn(),
	toggle: vi.fn(),
	set: vi.fn(),
};

const confirmProps = () => vi.mocked(ConfirmModal).mock.lastCall?.[0];

describe('DeleteDishButton', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useDisclosure).mockReturnValue([true, disclosure]);
	});

	it('asks before deleting', () => {
		const onDelete = vi.fn();
		render(<DeleteDishButton dishName="Soup" onDelete={onDelete} />);

		fireEvent.click(screen.getByRole('button', { name: 'Delete dish' }));

		expect(disclosure.open).toHaveBeenCalledTimes(1);
		expect(onDelete).not.toHaveBeenCalled();
	});

	it('closes the question and deletes the dish once confirmed', () => {
		const onDelete = vi.fn();
		render(<DeleteDishButton dishName="Soup" onDelete={onDelete} />);

		confirmProps()?.onConfirm();

		expect(disclosure.close).toHaveBeenCalledTimes(1);
		expect(onDelete).toHaveBeenCalledTimes(1);
	});

	it.each([
		{
			named: 'a named dish',
			dishName: 'Soup',
			message: 'Remove "Soup" from this meal?',
		},
		{
			named: 'a dish with no name',
			dishName: '',
			message: 'Remove this dish from this meal?',
		},
	])('names $named in the question', ({ dishName, message }) => {
		render(<DeleteDishButton dishName={dishName} onDelete={vi.fn()} />);

		expect(confirmProps()?.message).toBe(message);
	});
});
