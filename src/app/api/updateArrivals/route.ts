// app/api/updateArrivals/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import cron from 'node-cron';
import { Arrival, StopData } from '@/types';

const tflAppKey = process.env.TFL_APP_KEY;

const sortedArrivals: StopData[] = [
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

const updateArrivals = async () => {
    for (const stopData of sortedArrivals) {
        const stopId = stopData.stop_id;
        try {
            const response = await axios.get<Arrival[]>(
                `https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals?app_key=${tflAppKey}`
            );
            let arrivals = response.data;

            arrivals = arrivals.map((arrival) => {
                if (arrival.timeToStation <= 31) {
                    arrival.timeToStationMins = 'due';
                } else if (arrival.timeToStation <= 91) {
                    arrival.timeToStationMins = '1 min';
                } else {
                    arrival.timeToStationMins = `${Math.round(arrival.timeToStation / 60)} mins`;
                }
                return arrival;
            });

            stopData.arrivals = arrivals.sort((a, b) => a.timeToStation - b.timeToStation);

            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Error fetching arrivals:', error);
        }
    }
};

// Schedule the updateArrivals function to run every 5 seconds
cron.schedule('*/5 * * * * *', updateArrivals);

export async function GET() {
    return NextResponse.json({ stops: sortedArrivals });
}