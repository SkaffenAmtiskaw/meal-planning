export type TagColor =
	| 'tangerine'
	| 'rosewood'
	| 'honey'
	| 'fern'
	| 'seafoam'
	| 'steel'
	| 'lavender'
	| 'mauve'
	| 'sageMist'
	| 'slate';

export const TAG_COLORS: Record<
	TagColor,
	{ bg: string; text: string; border: string }
> = {
	tangerine: { bg: '#FDEBD6', text: '#7A3410', border: '#F5B47A' },
	rosewood: { bg: '#FDE8E8', text: '#7A1F1F', border: '#F0A8A8' },
	honey: { bg: '#FDF3D6', text: '#6B4A0D', border: '#EAC96A' },
	fern: { bg: '#E4F2E4', text: '#1E4D1E', border: '#87C287' },
	seafoam: { bg: '#D6EDE8', text: '#0E3D32', border: '#72C2AF' },
	steel: { bg: '#D9E8F5', text: '#0E2E4D', border: '#7AAFD4' },
	lavender: { bg: '#E8E0F0', text: '#3A1F6B', border: '#B09DD4' },
	mauve: { bg: '#F0E0EE', text: '#5C1A4A', border: '#CE8DC0' },
	sageMist: { bg: '#E8EDE0', text: '#2E3D1A', border: '#A8BA8A' },
	slate: { bg: '#E0E4ED', text: '#1C2744', border: '#8D99BE' },
};

export const THEME_COLORS = {
	navy: '#1C3144',
	forest: '#44633F',
	sage: '#B1BA95',
	ember: '#FF6542',
	chalk: '#EFE7E9',
} as const;

export const EMBER_RAMPS: [
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
] = [
	'#FFF0EB',
	'#FFE0D6',
	'#FFD0BF',
	'#FFC0A8',
	'#FFB091',
	'#FF6542',
	'#E55A3B',
	'#CC4F35',
	'#B2442E',
	'#993A28',
];

export const NAVY_RAMPS: [
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
	string,
] = [
	'#E8EBEE',
	'#D1D7DD',
	'#BAC3CC',
	'#A3AFBB',
	'#8C9BAA',
	'#1C3144',
	'#192C3D',
	'#162736',
	'#132230',
	'#101D29',
];

const TAG_COLOR_NAMES = Object.keys(TAG_COLORS) as TagColor[];

export function getMealColor(title: string): TagColor {
	let hash = 0;
	for (let i = 0; i < title.length; i++) {
		hash = title.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % TAG_COLOR_NAMES.length;
	return TAG_COLOR_NAMES[index];
}
