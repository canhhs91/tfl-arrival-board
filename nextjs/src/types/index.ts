/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Arrival {
    lineName: string;
    timeToStation: number;
    timeToStationMins?: string;
    destinationName?: string;
}

export interface StopData {
    order: number;
    stop_id: string;
    title: string;
    arrivals: Arrival[];
}

export type ResStopPointLatlon = {
    $type?: string;
    centrePoint?: number[];
    stopPoints?: StopPoint[];
    pageSize?: number;
    total?: number;
    page?: number;
}

export type StopPoint = {
    $type?: string;
    naptanId?: string;
    indicator?: string;
    stopLetter?: string;
    modes?: string[];
    icsCode?: string;
    stopType?: string;
    stationNaptan?: string;
    lines?: Line[];
    lineGroup?: LineGroup[];
    lineModeGroups?: LineModeGroup[];
    status?: boolean;
    id: string;
    commonName?: string;
    distance?: number;
    placeType?: string;
    additionalProperties?: AdditionalProperty[];
    children?: any[];
    lat?: number;
    lon?: number;
}

export type AdditionalProperty = {
    $type?: string;
    category?: string;
    key?: string;
    sourceSystemKey?: string;
    value?: string;
}

export type LineGroup = {
    $type?: string;
    naptanIdReference?: string;
    stationAtcoCode?: string;
    lineIdentifier?: string[];
}

export type LineModeGroup = {
    $type?: string;
    modeName?: string;
    lineIdentifier?: string[];
}

export type Line = {
    $type?: string;
    id?: string;
    name?: string;
    uri?: string;
    type?: string;
    crowding?: Crowding;
    routeType?: string;
    status?: string;
}

export type Crowding = {
    $type?: string;
}