import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

import { AuthLayoutFormSection } from './AuthLayoutFormSection';

describe('AuthLayoutFormSection', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders form elements with proper spacing', () => {
		render(
			<AuthLayoutFormSection>
				<input data-testid="email-input" />
				<input data-testid="password-input" />
			</AuthLayoutFormSection>,
		);

		expect(screen.getByTestId('email-input')).toBeDefined();
		expect(screen.getByTestId('password-input')).toBeDefined();
	});
});
