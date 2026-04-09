/**
 * Shared mock for @mantine/core.
 *
 * Usage in a test file:
 *
 *   vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'))
 *
 * All components are `vi.fn()` instances, so you can inspect props:
 *
 *   import { Select } from '@mantine/core'
 *   expect(vi.mocked(Select)).toHaveBeenCalledWith(
 *     expect.objectContaining({ data: [...] }),
 *     undefined,
 *   )
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(Comp).mockImplementationOnce(...)` to override for a single test.
 */

import { vi } from 'vitest';

// ─── Shared prop shapes ───────────────────────────────────────────────────────

type WithChildren = {
	children?: React.ReactNode;
	'data-testid'?: string;
};

type WithTestId = { 'data-testid'?: string };

// ─── Layout / Container ───────────────────────────────────────────────────────

export const AppShell = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

export const AppShellHeader = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

export const AppShellMain = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

export const AppShellNavbar = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

export const Box = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

export const Card = vi.fn(
	({
		children,
		onClick,
		'data-testid': testId,
	}: WithChildren & { onClick?: React.MouseEventHandler<HTMLDivElement> }) => (
		<div data-testid={testId} onClick={onClick}>
			{children}
		</div>
	),
);

export const Center = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

export const Container = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

export const Fieldset = vi.fn(
	({
		children,
		'data-testid': testId,
	}: WithChildren & { legend?: string; disabled?: boolean }) => (
		<fieldset data-testid={testId}>{children}</fieldset>
	),
);

export const Group = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

export const SimpleGrid = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

export const Stack = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

// ─── Grid (compound) ─────────────────────────────────────────────────────────

const GridCol = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

export const Grid = Object.assign(
	vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
		<div data-testid={testId}>{children}</div>
	)),
	{ Col: GridCol },
);

// ─── Typography ───────────────────────────────────────────────────────────────

export const Text = vi.fn(
	({
		children,
		'data-testid': testId,
	}: WithChildren & { c?: string; size?: string; fw?: number; span?: boolean }) => (
		<p data-testid={testId}>{children}</p>
	),
);

export const Title = vi.fn(
	({ children, 'data-testid': testId }: WithChildren & { order?: number }) => (
		<h2 data-testid={testId}>{children}</h2>
	),
);

export const Typography = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

export const Anchor = vi.fn(
	({
		children,
		href,
		target,
		onClick,
		'data-testid': testId,
	}: WithChildren & {
		href?: string;
		target?: string;
		onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
		component?: unknown;
	}) => (
		<a data-testid={testId} href={href} target={target} onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}>
			{children}
		</a>
	),
);

export const Badge = vi.fn(
	({ children, 'data-testid': testId, color }: WithChildren & { color?: string }) => (
		<span data-testid={testId ?? 'badge'} data-color={color}>
			{children}
		</span>
	),
);

export const Divider = vi.fn(({ 'data-testid': testId }: WithTestId) => (
	<hr data-testid={testId} />
));

// ─── Alert ────────────────────────────────────────────────────────────────────

export const Alert = vi.fn(
	({
		children,
		'data-testid': testId,
		title,
	}: WithChildren & { title?: React.ReactNode; color?: string; icon?: React.ReactNode }) => (
		<div role="alert" data-testid={testId}>
			{title && <div>{title}</div>}
			{children}
		</div>
	),
);

// ─── Buttons ──────────────────────────────────────────────────────────────────

export const ActionIcon = vi.fn(
	({
		children,
		onClick,
		disabled,
		href,
		'data-testid': testId,
	}: {
		children?: React.ReactNode;
		onClick?: () => void;
		disabled?: boolean;
		href?: string;
		'data-testid'?: string;
		[key: string]: unknown;
	}) =>
		href ? (
			<a href={href} data-testid={testId}>
				{children}
			</a>
		) : (
			<button type="button" onClick={onClick} disabled={disabled} data-testid={testId}>
				{children}
			</button>
		),
);

export const Burger = vi.fn(
	({
		onClick,
		opened,
		'data-testid': testId,
	}: {
		onClick?: () => void;
		opened?: boolean;
		'data-testid'?: string;
	}) => (
		<button
			type="button"
			onClick={onClick}
			data-opened={opened}
			data-testid={testId}
		/>
	),
);

export const Button = vi.fn(
	({
		children,
		onClick,
		type,
		disabled,
		loading,
		'data-testid': testId,
	}: {
		children?: React.ReactNode;
		onClick?: () => void;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		loading?: boolean;
		'data-testid'?: string;
		[key: string]: unknown;
	}) => (
		<button
			type={type ?? 'button'}
			onClick={onClick}
			disabled={disabled || loading}
			data-loading={loading ? 'true' : undefined}
			data-testid={testId}
		>
			{children}
		</button>
	),
);

// ─── Form inputs ──────────────────────────────────────────────────────────────

export const NumberInput = vi.fn(
	({
		value,
		onChange,
		label,
		'data-testid': testId,
	}: {
		value?: number | string;
		onChange?: (value: number | string) => void;
		label?: string;
		'data-testid'?: string;
		[key: string]: unknown;
	}) => (
		<input
			type="number"
			data-testid={testId ?? `number-${label}`}
			value={value ?? ''}
			onChange={(e) => onChange?.(Number(e.target.value))}
		/>
	),
);

export const PasswordInput = vi.fn(
	({
		value,
		onChange,
		label,
		'data-testid': testId,
	}: {
		value?: string;
		onChange?: React.ChangeEventHandler<HTMLInputElement>;
		label?: string;
		'data-testid'?: string;
		[key: string]: unknown;
	}) => (
		<input
			type="password"
			data-testid={testId ?? `input-${label}`}
			value={value ?? ''}
			onChange={onChange ?? (() => {})}
		/>
	),
);

export const SegmentedControl = vi.fn(
	({
		value,
		onChange,
		data,
		'data-testid': testId,
	}: {
		value?: string;
		onChange?: (value: string) => void;
		data?: { label: string; value: string }[];
		'data-testid'?: string;
	}) => (
		<div data-testid={testId}>
			{(data ?? []).map((d) => (
				<button
					key={d.value}
					type="button"
					data-value={d.value}
					data-active={value === d.value}
					onClick={() => onChange?.(d.value)}
				>
					{d.label}
				</button>
			))}
		</div>
	),
);

export const Select = vi.fn(
	({
		value,
		onChange,
		'data-testid': testId,
	}: {
		value?: string | null;
		onChange?: (value: string | null) => void;
		data?: { value: string; label: string }[] | string[];
		'data-testid'?: string;
		[key: string]: unknown;
	}) => (
		<select
			data-testid={testId}
			value={value ?? ''}
			onChange={(e) => onChange?.(e.currentTarget.value || null)}
		/>
	),
);

export const Switch = vi.fn(
	({
		checked,
		onChange,
		label,
		'data-testid': testId,
	}: {
		checked?: boolean;
		onChange?: React.ChangeEventHandler<HTMLInputElement>;
		label?: string;
		'data-testid'?: string;
	}) => (
		<label>
			{label}
			<input
				type="checkbox"
				data-testid={testId}
				checked={checked ?? false}
				onChange={onChange ?? (() => {})}
			/>
		</label>
	),
);

export const TextInput = vi.fn(
	({
		value,
		onChange,
		label,
		type,
		name,
		placeholder,
		'data-testid': testId,
	}: {
		value?: string;
		onChange?: React.ChangeEventHandler<HTMLInputElement>;
		label?: string;
		type?: string;
		name?: string;
		placeholder?: string;
		'data-testid'?: string;
		[key: string]: unknown;
	}) => (
		<input
			data-testid={testId ?? `input-${name ?? label}`}
			type={type}
			value={value ?? ''}
			placeholder={placeholder}
			onChange={onChange ?? (() => {})}
		/>
	),
);

export const Textarea = vi.fn(
	({
		value,
		onChange,
		label,
		'data-testid': testId,
	}: {
		value?: string;
		onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
		label?: string;
		'data-testid'?: string;
		[key: string]: unknown;
	}) => (
		<textarea
			data-testid={testId ?? `textarea-${label}`}
			value={value ?? ''}
			onChange={onChange ?? (() => {})}
		/>
	),
);

// ─── Input (compound) ─────────────────────────────────────────────────────────

const InputLabel = vi.fn(({ children }: { children?: React.ReactNode }) => (
	<span>{children}</span>
));

export const Input = Object.assign(
	vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
		<div data-testid={testId}>{children}</div>
	)),
	{ Label: InputLabel },
);

// ─── Modal ────────────────────────────────────────────────────────────────────

export const Modal = vi.fn(
	({
		children,
		opened,
		onClose,
		title,
		'data-testid': testId,
	}: {
		children?: React.ReactNode;
		opened?: boolean;
		onClose?: () => void;
		title?: React.ReactNode;
		'data-testid'?: string;
		[key: string]: unknown;
	}) =>
		opened ? (
			<div role="dialog" data-testid={testId}>
				{title && <div>{title}</div>}
				<button type="button" aria-label="close" onClick={onClose}>
					×
				</button>
				{children}
			</div>
		) : null,
);

// ─── Navigation ───────────────────────────────────────────────────────────────

export const Avatar = vi.fn(
	({ 'data-testid': testId }: WithTestId & { src?: string; alt?: string }) => (
		<div data-testid={testId} />
	),
);

export const NavLink = vi.fn(
	({
		children,
		label,
		href,
		active,
		'data-testid': testId,
	}: WithChildren & {
		label?: React.ReactNode;
		href?: string;
		active?: boolean;
		component?: string;
	}) => (
		<a href={href} data-active={active || undefined} data-testid={testId}>
			{label}
			{children}
		</a>
	),
);

// ─── List ─────────────────────────────────────────────────────────────────────

export const List = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<ul data-testid={testId}>{children}</ul>
));

export const ListItem = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<li data-testid={testId}>{children}</li>
));

// ─── Menu (compound + standalone named exports) ───────────────────────────────

export const MenuDivider = vi.fn(() => <hr />);

export const MenuDropdown = vi.fn(({ children }: { children?: React.ReactNode }) => (
	<>{children}</>
));

export const MenuItem = vi.fn(
	({
		children,
		onClick,
		href,
		component,
		'data-testid': testId,
	}: {
		children?: React.ReactNode;
		onClick?: () => void;
		href?: string;
		component?: string;
		'data-testid'?: string;
		[key: string]: unknown;
	}) =>
		href || component === 'a' ? (
			<a data-testid={testId} href={href} onClick={onClick}>
				{children}
			</a>
		) : (
			<button type="button" data-testid={testId} onClick={onClick}>
				{children}
			</button>
		),
);

export const MenuTarget = vi.fn(({ children }: { children?: React.ReactNode }) => (
	<>{children}</>
));

export const Menu = Object.assign(
	vi.fn(({ children }: { children?: React.ReactNode }) => <>{children}</>),
	{
		Divider: MenuDivider,
		Dropdown: MenuDropdown,
		Item: MenuItem,
		Target: MenuTarget,
	},
);

// ─── Combobox (compound) ──────────────────────────────────────────────────────

const ComboboxDropdownTarget = vi.fn(({ children }: { children?: React.ReactNode }) => (
	<>{children}</>
));

const ComboboxDropdown = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId ?? 'combobox-dropdown'}>{children}</div>
));

const ComboboxOptions = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

const ComboboxOption = vi.fn(
	({
		children,
		value,
		'data-testid': testId,
	}: WithChildren & { value?: string }) => (
		<div data-testid={testId ?? `option-${value}`} data-value={value}>
			{children}
		</div>
	),
);

const ComboboxEmpty = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

export const Combobox = Object.assign(
	vi.fn(
		({
			children,
			'data-testid': testId,
		}: WithChildren & {
			onOptionSubmit?: (val: string) => void;
			store?: unknown;
		}) => <div data-testid={testId ?? 'combobox'}>{children}</div>,
	),
	{
		DropdownTarget: ComboboxDropdownTarget,
		Dropdown: ComboboxDropdown,
		Options: ComboboxOptions,
		Option: ComboboxOption,
		Empty: ComboboxEmpty,
	},
);

// ─── Pill (compound) ──────────────────────────────────────────────────────────

const PillGroup = vi.fn(({ children }: { children?: React.ReactNode }) => (
	<div>{children}</div>
));

export const Pill = Object.assign(
	vi.fn(
		({
			children,
			withRemoveButton,
			onRemove,
			'data-testid': testId,
		}: {
			children?: React.ReactNode;
			withRemoveButton?: boolean;
			onRemove?: () => void;
			'data-testid'?: string;
			style?: React.CSSProperties;
		}) => (
			<span data-testid={testId ?? 'pill'}>
				{children}
				{withRemoveButton && (
					<button type="button" data-testid="pill-remove" onClick={onRemove}>
						×
					</button>
				)}
			</span>
		),
	),
	{ Group: PillGroup },
);

// ─── PillsInput (compound) ────────────────────────────────────────────────────

const PillsInputField = vi.fn(
	(
		props: React.InputHTMLAttributes<HTMLInputElement> & { 'data-testid'?: string },
	) => <input {...props} data-testid={props['data-testid'] ?? 'pills-input-field'} />,
);

export const PillsInput = Object.assign(
	vi.fn(
		({
			children,
			label,
			onClick,
			'data-testid': testId,
		}: {
			children?: React.ReactNode;
			label?: string;
			onClick?: () => void;
			'data-testid'?: string;
		}) => (
			<button type="button" data-testid={testId ?? 'pills-input'} onClick={onClick}>
				{label && <span>{label}</span>}
				{children}
			</button>
		),
	),
	{ Field: PillsInputField },
);

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export const TabsList = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div role="tablist" data-testid={testId}>{children}</div>
));

export const TabsTab = vi.fn(
	({
		children,
		value,
		'data-testid': testId,
	}: WithChildren & { value?: string }) => (
		<button type="button" role="tab" data-value={value} data-testid={testId}>
			{children}
		</button>
	),
);

export const TabsPanel = vi.fn(
	({
		children,
		value,
		'data-testid': testId,
	}: WithChildren & { value?: string }) => (
		<div role="tabpanel" data-value={value} data-testid={testId}>
			{children}
		</div>
	),
);

export const Tabs = vi.fn(({ children, 'data-testid': testId }: WithChildren) => (
	<div data-testid={testId}>{children}</div>
));

// ─── Provider ─────────────────────────────────────────────────────────────────

export const MantineProvider = vi.fn(({ children }: { children?: React.ReactNode }) => (
	<>{children}</>
));

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useCombobox = vi.fn(
	(_options?: { onDropdownClose?: () => void; onDropdownOpen?: () => void }) => ({
		openDropdown: vi.fn(),
		closeDropdown: vi.fn(),
		resetSelectedOption: vi.fn(),
		updateSelectedOptionIndex: vi.fn(),
	}),
);

export const useMantineTheme = vi.fn(() => ({
	colors: {} as Record<string, string[]>,
}));

// ─── Utilities ────────────────────────────────────────────────────────────────

export const createTheme = vi.fn((theme: Record<string, unknown>) => theme);
export const isLightColor = vi.fn(() => false);
export const mantineHtmlProps = {};

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModalProps = {
	opened: boolean;
	onClose: () => void;
	title?: React.ReactNode;
	children?: React.ReactNode;
};
