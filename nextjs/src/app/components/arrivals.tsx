import { getArrival } from '@/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { QUERY_KEYS } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

type Props = {
    stop_id?: string
}

export default function Arrivals({ stop_id }: Props) {
    const { data: arrivals, isLoading } = useQuery({
        queryKey: [QUERY_KEYS.STOPS, stop_id],
        queryFn: () => getArrival(stop_id!),
        enabled: !!stop_id,
        refetchInterval: 1000
    });
    if (isLoading) {
        return Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="arrival-item">
                <div className="order">
                    {index + 1}
                </div>
                <div className="line-name flex justify-end">
                    <Skeleton className="h-5 w-[100px] bg-[#ffc80a] rounded-full" />
                </div>
                <div className="destination w-full">
                    <Skeleton className="h-5 w-full bg-[#ffc80a] rounded-full" />
                </div>
                <div className="time-to-station">
                    <Skeleton className="h-5 w-[100px] bg-[#ffc80a] rounded-full" />
                </div>
            </div>
        ))
    }
    return (
        arrivals?.slice(0, 3).map((arrival, index) => (
            <div key={index} className="arrival-item">
                <div className="order">{index + 1}</div>
                <div className="line-name">{arrival.lineName}</div>
                <div className="destination">
                    <div className="destination-text">
                        {arrival.destinationName}
                    </div>
                </div>
                <div className="time-to-station">{arrival.timeToStationMins}</div>
            </div>
        ))
    )
}