'use client';

import { useContext } from 'react';

import { TimeZoneContext } from './TimeZoneProvider';

// The viewer's time zone, or null while it isn't known yet.
export const useTimeZone = (): string | null => useContext(TimeZoneContext);
