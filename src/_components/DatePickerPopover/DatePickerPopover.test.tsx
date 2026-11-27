import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DatePickerPopover } from './DatePickerPopover';

vi.mock('../AdaptivePopover', () => ({
	AdaptivePopover: vi.fn(
		({
			opened,
			onClose,
			target,
			children,
		}: {
			opened: boolean;
			onClose: () => void;
			target: React.ReactNode;
			children: React.ReactNode;
		}) => (
			<>
				{target}
				{opened && (
					<div>
						<button type="button" onClick={onClose}>
							Dismiss
						</button>
						{children}
					</div>
				)}
			</>
		),
	),
}));

vi.mock('../DatePickerPanel', () => ({
	DatePickerPanel: vi.fn(
		({ onChange }: { onChange: (date: string) => void }) => (
			<input
				type="date"
				data-testid="date-picker-panel"
				onChange={(event) => onChange(event.target.value)}
			/>
		),
	),
}));

const onChange = vi.fn();

function renderPopover() {
	return render(
		<DatePickerPopover
			value="2024-06-15"
			onChange={onChange}
			sheetTitle="Jump to date"
			renderTrigger={({ opened, onClick }) => (
				<button type="button" data-opened={String(opened)} onClick={onClick}>
					Open
				</button>
			)}
		/>,
	);
}

const trigger = () => screen.getByRole('button', { name: 'Open' });

describe('DatePickerPopover', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('opens the picker when the trigger is clicked, and tells the trigger', () => {
		renderPopover();
		expect(screen.queryByTestId('date-picker-panel')).toBeNull();
		expect(trigger().getAttribute('data-opened')).toBe('false');

		fireEvent.click(trigger());

		expect(screen.getByTestId('date-picker-panel')).toBeDefined();
		expect(trigger().getAttribute('data-opened')).toBe('true');
	});

	it('closes the picker when the trigger is clicked again', () => {
		renderPopover();

		fireEvent.click(trigger());
		fireEvent.click(trigger());

		expect(screen.queryByTestId('date-picker-panel')).toBeNull();
	});

	it('closes when the popover or sheet asks to, such as on Esc or a click outside', () => {
		renderPopover();
		fireEvent.click(trigger());

		fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

		expect(screen.queryByTestId('date-picker-panel')).toBeNull();
	});

	it('reports the picked date and closes', () => {
		renderPopover();
		fireEvent.click(trigger());

		fireEvent.change(screen.getByTestId('date-picker-panel'), {
			target: { value: '2024-07-20' },
		});

		expect(onChange).toHaveBeenCalledWith('2024-07-20');
		expect(screen.queryByTestId('date-picker-panel')).toBeNull();
	});
});
