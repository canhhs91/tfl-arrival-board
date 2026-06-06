"use server";

import { STOP_POINT_DEFAULT } from "@/constants";
import { apiTflClient } from "@/lib/api-client";
import { formatArrivalTime } from "@/lib/utils";
import { Arrival, DestinationSuggestion, Journey, JourneyLeg, NextStop, ResStopPointLatlon, StopData, StopPoint } from "@/types";

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

// Geocode arbitrary free text (e.g. "gooseley playing field") to its first
// match's coordinates via Nominatim, then return the bus stops nearby.
async function geocodeToNearbyStops(query: string): Promise<{ stops: StopData[]; location: string | null }> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=gb&format=json&addressdetails=1&limit=1`,
            { headers: { "User-Agent": "tfl-arrival-board/1.0" } }
        );
        const data = (await res.json()) as NominatimResult[];
        const first = data[0];
        if (!first) return { stops: [], location: null };
        const { stops } = await getStopPoints({
            lat: parseFloat(first.lat),
            long: parseFloat(first.lon),
        });
        return { stops, location: formatNominatimName(first) };
    } catch {
        return { stops: [], location: null };
    }
}

// Free-text search that first tries TfL stop names, then falls back to
// geocoding the query to a place and returning nearby bus stops.
export async function searchStops(query: string): Promise<{ stops: StopData[]; location?: string }> {
    const q = query.trim();
    if (!q) return { stops: [] };
    const byName = await searchStopsByName(q);
    if (byName.stops.length > 0) return byName;
    const { stops, location } = await geocodeToNearbyStops(q);
    return { stops, ...(location ? { location } : {}) };
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

type TflSearchResponse = {
    matches?: { id: string; name: string }[];
};

type NominatimResult = {
    lat: string;
    lon: string;
    display_name: string;
    address?: { postcode?: string };
};

type TflJourneyResponse = {
    journeys?: {
        startDateTime: string;
        duration: number;
        legs: {
            duration: number;
            departureTime: string;
            mode: { id: string };
            instruction?: { summary: string };
            routeOptions?: { name: string }[];
            departurePoint: { commonName: string };
            arrivalPoint: { commonName: string };
        }[];
    }[];
};

function formatNominatimName(r: NominatimResult): string {
    const segments = r.display_name.split(',').map((s) => s.trim());
    const postcode = r.address?.postcode;
    const core = segments.slice(0, 3).join(', ');
    return postcode && !core.includes(postcode) ? `${core}, ${postcode}` : core;
}

export async function searchDestinations(query: string): Promise<DestinationSuggestion[]> {
    const q = query.trim();
    if (q.length < 2) return [];

    const [tflResult, nominatimResult] = await Promise.allSettled([
        apiTflClient
            .get<TflSearchResponse>(`/StopPoint/Search/${encodeURIComponent(q)}`, { params: { maxResults: 4 } })
            .then((r) => (r.data.matches ?? []).map((m): DestinationSuggestion => ({ id: m.id, name: m.name, type: 'stop' }))),

        fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=gb&format=json&addressdetails=1&limit=3`,
            { headers: { 'User-Agent': 'tfl-arrival-board/1.0' } }
        )
            .then((r) => r.json() as Promise<NominatimResult[]>)
            .then((data) =>
                data.map((r): DestinationSuggestion => ({
                    id: `${parseFloat(r.lat).toFixed(5)},${parseFloat(r.lon).toFixed(5)}`,
                    name: formatNominatimName(r),
                    type: 'address',
                }))
            ),
    ]);

    const stops = tflResult.status === 'fulfilled' ? tflResult.value : [];
    const addresses = nominatimResult.status === 'fulfilled' ? nominatimResult.value : [];
    return [...stops, ...addresses].slice(0, 7);
}

export async function searchPlaces(query: string): Promise<{ id: string; name: string }[]> {
    const q = query.trim();
    if (q.length < 2) return [];
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=gb&format=json&addressdetails=1&limit=5`,
            { headers: { 'User-Agent': 'tfl-arrival-board/1.0' } }
        );
        const data = (await res.json()) as NominatimResult[];
        return data.map((r) => ({
            id: `${parseFloat(r.lat).toFixed(5)},${parseFloat(r.lon).toFixed(5)}`,
            name: formatNominatimName(r),
        }));
    } catch {
        return [];
    }
}

export async function planJourney(fromStopId: string, toId: string): Promise<Journey[]> {
    try {
        const res = await apiTflClient.get<TflJourneyResponse>(
            `/Journey/JourneyResults/${encodeURIComponent(fromStopId)}/to/${encodeURIComponent(toId)}`
        );
        const raw = res.data.journeys ?? [];
        if (raw.length === 0) return [];

        return raw.map((journey) => ({
            totalDuration: journey.duration,
            departureTime: journey.startDateTime,
            legs: journey.legs
                .filter((l) => l.mode.id !== 'walking' || l.duration > 2)
                .map((l) => ({
                    mode: l.mode.id,
                    line: l.routeOptions?.[0]?.name ?? '',
                    instruction: l.instruction?.summary ?? '',
                    from: l.departurePoint.commonName,
                    to: l.arrivalPoint.commonName,
                    departureTime: l.departureTime,
                    duration: l.duration,
                })),
        }));
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