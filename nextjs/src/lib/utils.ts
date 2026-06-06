import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatArrivalTime = (timeToStation: number): string => {
    if (timeToStation <= 31) return 'due';
    if (timeToStation <= 91) return '1 min';
    return `${Math.round(timeToStation / 60)} mins`;
};

const STOP_TITLE_PATTERN = /(.*)\s(\(Stop\s[A-Z]\))/;

/**
 * Splits a TfL stop title such as "Sullivan Avenue (Stop K)" into its name and
 * stop letter. Returns the whole title as `name` (and an empty letter) when the
 * "(Stop X)" suffix is absent.
 */
export const parseStopTitle = (
    title: string | undefined
): { name: string; stopLetter: string } => {
    if (!title) return { name: "", stopLetter: "" };
    const match = title.match(STOP_TITLE_PATTERN);
    if (match) return { name: match[1], stopLetter: match[2] };
    return { name: title, stopLetter: "" };
};