import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import SettingsPage from './page';

vi.mock('@mantine/core', () => ({
	Container: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Title: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
}));

describe('SettingsPage', () => {
	test('renders Settings heading', () => {
		render(<SettingsPage />);
		expect(screen.getByText('Settings')).toBeDefined();
	});
});
