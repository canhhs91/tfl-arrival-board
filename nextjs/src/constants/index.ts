import { StopData } from "@/types";

export const STOP_POINT_DEFAULT: StopData[] = [
    {
        order: 1,
        stop_id: '490003753W',
        title: 'Sullivan Avenue (Stop K)',
        arrivals: [],
    },
    {
        order: 2,
        stop_id: '490003753E',
        title: 'Sullivan Avenue (Stop J)',
        arrivals: [],
    },
    {
        order: 3,
        stop_id: '490010220S',
        title: 'Newham Way (Stop C)',
        arrivals: [],
    },
    {
        order: 4,
        stop_id: '490009092E',
        title: 'Custom House Station - Lisie Road (Stop E)',
        arrivals: [],
    },
];


export const QUERY_KEYS = {
    STOPS: 'stops',
    ARRIVALS: 'arrivals',
} as const;