import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useEscapeLayer, useIsMobile } from '@/_hooks';

import { AdaptivePopover } from './AdaptivePopover';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('../BottomSheet', () => ({
	BottomSheet: vi.fn(
		({ opened, children }: { opened: boolean; children: React.ReactNode }) =>
			opened ? <div data-testid="bottom-sheet">{children}</div> : null,
	),
}));

function renderAdaptivePopover({ opened = true } = {}) {
	return render(
		<AdaptivePopover
			opened={opened}
			onClose={vi.fn()}
			sheetTitle="Jump to date"
			target={<button type="button">Open</button>}
		>
			Content
		</AdaptivePopover>,
	);
}

describe('AdaptivePopover', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows its content in a popover on desktop', () => {
		renderAdaptivePopover();

		expect(screen.getByTestId('popover-dropdown').textContent).toBe('Content');
		expect(screen.queryByTestId('bottom-sheet')).toBeNull();
	});

	it('shows its content in a bottom sheet on phones', () => {
		vi.mocked(useIsMobile).mockReturnValueOnce(true);

		renderAdaptivePopover();

		expect(screen.getByTestId('bottom-sheet').textContent).toBe('Content');
		expect(screen.queryByTestId('popover-dropdown')).toBeNull();
	});

	it.each([
		true,
		false,
	])('takes Esc from a modal it sits in only while open (open: %s)', (opened) => {
		renderAdaptivePopover({ opened });

		expect(useEscapeLayer).toHaveBeenLastCalledWith(opened);
	});

	it.each([
		{ opened: true, expanded: 'true' },
		{ opened: false, expanded: 'false' },
	])('tells screen readers on phones that its target opens a dialog, expanded $expanded', ({
		opened,
		expanded,
	}) => {
		vi.mocked(useIsMobile).mockReturnValueOnce(true);

		renderAdaptivePopover({ opened });

		const target = screen.getByRole('button', { name: 'Open' });
		expect(target.getAttribute('aria-haspopup')).toBe('dialog');
		expect(target.getAttribute('aria-expanded')).toBe(expanded);
	});
});
