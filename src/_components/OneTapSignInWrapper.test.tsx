import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { useOneTap } from '@/_hooks';

import { OneTapSignInWrapper } from './OneTapSignInWrapper';

vi.mock('@/_hooks', () => ({
	useOneTap: vi.fn(),
}));

describe('one tap sign in wrapper', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders children', () => {
		render(
			<OneTapSignInWrapper>
				<div>Maleficent&apos;s Portal</div>
			</OneTapSignInWrapper>,
		);

		expect(screen.getByText("Maleficent's Portal")).toBeDefined();
	});

	test('calls useOneTap on mount', () => {
		render(
			<OneTapSignInWrapper>
				<span />
			</OneTapSignInWrapper>,
		);

		expect(useOneTap).toHaveBeenCalledOnce();
	});
});
