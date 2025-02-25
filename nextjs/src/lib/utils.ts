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