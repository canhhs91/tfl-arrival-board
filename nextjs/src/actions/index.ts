"use server";

import { STOP_POINT_DEFAULT } from "@/constants";
import { apiTflClient } from "@/lib/api-client";
import { formatArrivalTime } from "@/lib/utils";
import { Arrival, NextStop, ResStopPointLatlon, StopData, StopPoint } from "@/types";

type SearchResponse = {
    matches?: { id: string; name: string; modes?: string[] }[];
};

const stopTitle = (commonName?: string, indicator?: string) =>
    indicator ? `${commonName} (${indicator})` : `${commonName ?? ""}`;

const isBus = (modes?: string[]) => !!modes?.includes("bus");

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
                    // lat: 51.5107669428816, 
                    // lon: -0.15143186108281614,
                    radius: 500,
                }
            }
        );

        const stopPoints: StopData[] = response.data.stopPoints?.slice(0, 6)?.map((stopPoint, index) => ({
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

export async function searchStopsByName(query: string): Promise<{ stops: StopData[] }> {
    const q = query.trim();
    if (!q) return { stops: [] };
    try {
        const search = await apiTflClient.get<SearchResponse>(
            `/StopPoint/Search/${encodeURIComponent(q)}`,
            { params: { modes: "bus", maxResults: 6 } }
        );
        const matches = search.data.matches ?? [];

        // Search returns a mix of parent hubs (no arrivals) and individual
        // stops. Resolve each match to arrival-capable individual stops by
        // expanding parents into their bus children.
        const details = await Promise.all(
            matches.map((m) =>
                apiTflClient
                    .get<StopPoint>(`/StopPoint/${m.id}`)
                    .then((r) => r.data)
                    .catch(() => null)
            )
        );

        const seen = new Set<string>();
        const stops: StopData[] = [];
        for (const d of details) {
            if (!d) continue;
            const busChildren = ((d.children ?? []) as StopPoint[]).filter((c) =>
                isBus(c.modes)
            );
            const leaves =
                busChildren.length > 0
                    ? busChildren.map((c) => ({
                          stop_id: c.naptanId ?? c.id,
                          title: stopTitle(d.commonName, c.indicator),
                      }))
                    : isBus(d.modes)
                    ? [
                          {
                              stop_id: d.naptanId ?? d.id,
                              title: stopTitle(d.commonName, d.indicator),
                          },
                      ]
                    : [];
            for (const leaf of leaves) {
                if (!leaf.stop_id || seen.has(leaf.stop_id)) continue;
                seen.add(leaf.stop_id);
                stops.push({ order: stops.length, arrivals: [], ...leaf });
            }
        }
        return { stops: stops.slice(0, 15) };
    } catch {
        return { stops: [] };
    }
}

type RouteSequenceResponse = {
    stopPointSequences: { stopPoint: { id: string; name: string }[] }[];
    orderedLineRoutes: { naptanIds: string[] }[];
};

export async function getNextStops(lineId: string, currentStopId: string): Promise<NextStop[]> {
    try {
        const [inbound, outbound] = await Promise.all([
            apiTflClient.get<RouteSequenceResponse>(`/Line/${lineId}/Route/Sequence/inbound`).catch(() => null),
            apiTflClient.get<RouteSequenceResponse>(`/Line/${lineId}/Route/Sequence/outbound`).catch(() => null),
        ]);

        const extract = (res: typeof inbound) => {
            if (!res) return [];
            // Build id->name from stopPointSequences[].stopPoint
            const nameMap: Record<string, string> = {};
            for (const seq of res.data.stopPointSequences ?? []) {
                for (const sp of seq.stopPoint ?? []) {
                    nameMap[sp.id] = sp.name;
                }
            }
            // Ordered stop IDs live in orderedLineRoutes[].naptanIds
            return (res.data.orderedLineRoutes ?? []).map(r => ({
                naptanIds: r.naptanIds,
                nameMap,
            }));
        };

        const allRoutes = [...extract(inbound), ...extract(outbound)];

        for (const { naptanIds, nameMap } of allRoutes) {
            const currentIdx = naptanIds.indexOf(currentStopId);
            if (currentIdx === -1) continue;
            return naptanIds.slice(currentIdx + 1).map(id => ({
                naptanId: id,
                name: nameMap[id] ?? id,
            }));
        }

        return [];
    } catch {
        return [];
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