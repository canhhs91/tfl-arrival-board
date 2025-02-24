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