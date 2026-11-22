import type { MantineColorsTuple } from '@mantine/core';

import type { TagColor } from './types';

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

/** The navbar's background. No forest shade matches it. */
export const SAGE = '#B1BA95';

/** The border of text inputs. No chalk shade matches it. */
export const INPUT_BORDER = '#C8C0C3';

export const EMBER_RAMPS: MantineColorsTuple = [
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

export const FOREST_RAMPS: MantineColorsTuple = [
	'#EFF3EF',
	'#DFE7DF',
	'#CFDBCE',
	'#BFCEBE',
	'#AFC2AE',
	'#44633F',
	'#3C5736',
	'#344C2E',
	'#2C4126',
	'#24361E',
];

export const NAVY_RAMPS: MantineColorsTuple = [
	'#E8EBEE',
	'#D1D7DD',
	'#BAC3CC',
	'#A3AFBB',
	'#8C9BAA',
	'#1C3144',
	/**
	 * Shade 6 is the hover on a filled navy control, so most of the drop from shade 5 to
	 * shade 9 comes before it, where the hover shows. Shade 9 is the text of the light and
	 * subtle variants, so it stays navy rather than going near-black.
	 */
	'#152635',
	'#142331',
	'#12202D',
	'#101D29',
];

/**
 * Built like the ember ramp: shades 0-4 go from white toward the main shade in 10% steps, and
 * shades 6-9 darken it by 10-40%.
 */
export const SAGE_RAMPS: MantineColorsTuple = [
	'#F7F8F4',
	'#EFF1EA',
	'#E8EADF',
	'#E0E3D5',
	'#D8DCCA',
	SAGE,
	'#9FA786',
	'#8E9577',
	'#7C8268',
	'#6A7059',
];

export const CHALK_RAMPS: MantineColorsTuple = [
	'#FAF8F9',
	'#F5F3F4',
	'#F0EDEE',
	'#EBE8E9',
	'#E6E3E4',
	'#EFE7E9',
	'#E8E0E2',
	'#E1D9DB',
	'#DAD2D4',
	'#D3CBCB',
];

export const TAG_COLOR_NAMES = Object.keys(TAG_COLORS) as TagColor[];

export function getMealColor(title: string): TagColor {
	let hash = 0;
	for (let i = 0; i < title.length; i++) {
		hash = title.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % TAG_COLOR_NAMES.length;
	return TAG_COLOR_NAMES[index];
}
