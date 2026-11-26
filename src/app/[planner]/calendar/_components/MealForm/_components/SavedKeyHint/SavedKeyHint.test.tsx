import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SavedKeyHint } from './SavedKeyHint';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('SavedKeyHint', () => {
	it('says Enter adds and Esc clears the search outside link mode', () => {
		render(<SavedKeyHint linking={false} />);

		expect(screen.getByText('↑↓ move · ↵ add · Esc clear search')).toBeTruthy();
	});

	it('says Enter links and Esc cancels linking in link mode', () => {
		render(<SavedKeyHint linking />);

		expect(
			screen.getByText('↑↓ move · ↵ link · Esc cancel linking'),
		).toBeTruthy();
	});
});
