"use server";

import { STOP_POINT_DEFAULT } from "@/constants";
import { apiTflClient } from "@/lib/api-client";
import { formatArrivalTime } from "@/lib/utils";
import { Arrival, ResStopPointLatlon, StopData } from "@/types";

export async function getStopPoints({ lat, long }: { lat: number | null, long: number | null }): Promise<{ stops: StopData[] }> {
    try {
        if (!lat || !long) return { stops: STOP_POINT_DEFAULT }
        const response = await apiTflClient.get<ResStopPointLatlon>(
            `/StopPoint`,
            {
                params: {
                    stopTypes: ['NaptanPublicBusCoachTram'].join(','),
                    lat: lat,
                    lon: long,
                    radius: 500,
                }
            }
        );

        const stopPoints: StopData[] = response.data.stopPoints?.slice(0, 4)?.map((stopPoint, index) => ({
            arrivals: [],
            order: index,
            stop_id: stopPoint.id,
            title: `${stopPoint.commonName} (${stopPoint.indicator})`
        })) ?? [];

        return { stops: stopPoints };
    } catch (error) {
        throw new Error(error as string);
    }
}

export async function getArrival(stop_id: string) {
    try {
        const response = await apiTflClient.get<Arrival[]>(
            `StopPoint/${stop_id}/Arrivals`
        );
        const arrivals = response.data
            .map((arrival) => ({
                ...arrival,
                timeToStationMins: formatArrivalTime(arrival.timeToStation),
            }))
            .sort((a, b) => a.timeToStation - b.timeToStation);
        return arrivals;
    } catch {
        return []
    }

}