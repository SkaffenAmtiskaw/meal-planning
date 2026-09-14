import { useState } from 'react';

import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ControlledModal } from './ControlledModal';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));

describe('ControlledModal', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(useDisclosure).mockImplementation((initialState = false) => {
			const [opened, setOpened] = useState(initialState);
			return [
				opened,
				{
					open: vi.fn(() => setOpened(true)),
					close: vi.fn(() => setOpened(false)),
					toggle: vi.fn(),
					set: vi.fn(),
				},
			];
		});
	});

	const renderTrigger = ({ onOpen }: { onOpen: () => void }) => (
		<button data-testid="trigger" onClick={onOpen}>
			Open
		</button>
	);

	it('renders the trigger', () => {
		render(
			<ControlledModal trigger={renderTrigger}>
				{() => <div data-testid="content">Content</div>}
			</ControlledModal>,
		);
		expect(screen.getByTestId('trigger')).toBeDefined();
	});

	it('opens the modal when the trigger onOpen is called', () => {
		render(
			<ControlledModal trigger={renderTrigger}>
				{() => <div data-testid="content">Content</div>}
			</ControlledModal>,
		);
		expect(screen.queryByRole('dialog')).toBeNull();
		fireEvent.click(screen.getByTestId('trigger'));
		expect(screen.getByRole('dialog')).toBeDefined();
		expect(screen.getByTestId('content')).toBeDefined();
	});

	it('closes the modal when Modal onClose is called', () => {
		render(
			<ControlledModal trigger={renderTrigger}>
				{() => <div data-testid="content">Content</div>}
			</ControlledModal>,
		);
		fireEvent.click(screen.getByTestId('trigger'));
		expect(screen.getByRole('dialog')).toBeDefined();
		fireEvent.click(screen.getByRole('button', { name: /close/i }));
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('passes modalProps to the Modal', () => {
		render(
			<ControlledModal
				trigger={renderTrigger}
				modalProps={{ title: 'Test Title', size: 'lg' }}
			>
				{() => <div>Content</div>}
			</ControlledModal>,
		);
		fireEvent.click(screen.getByTestId('trigger'));
		expect(vi.mocked(Modal)).toHaveBeenCalledWith(
			expect.objectContaining({
				opened: true,
				onClose: expect.any(Function),
				title: 'Test Title',
				size: 'lg',
			}),
			undefined,
		);
	});

	it('preserves any existing onClick on the trigger returned by the render prop', () => {
		const existingOnClick = vi.fn();
		render(
			<ControlledModal
				trigger={() => (
					<button data-testid="trigger" onClick={existingOnClick}>
						Open
					</button>
				)}
			>
				{() => <div>Content</div>}
			</ControlledModal>,
		);
		fireEvent.click(screen.getByTestId('trigger'));
		expect(existingOnClick).toHaveBeenCalledOnce();
	});

	it('calls children as a function with onClose', () => {
		const childrenFn = vi.fn(() => (
			<div data-testid="child-content">Child</div>
		));
		render(
			<ControlledModal trigger={renderTrigger}>{childrenFn}</ControlledModal>,
		);
		fireEvent.click(screen.getByTestId('trigger'));
		expect(childrenFn).toHaveBeenCalledWith(
			expect.objectContaining({ onClose: expect.any(Function) }),
		);
		expect(screen.getByTestId('child-content')).toBeDefined();
	});
});
