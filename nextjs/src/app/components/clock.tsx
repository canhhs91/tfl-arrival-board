"use client"
import React, { useEffect, useState } from 'react'

export default function Clock() {
    const [clockTime, setClockTime] = useState('')
    const updateClock = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
        const formattedTime = `${String(formattedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${ampm}`;
        setClockTime(formattedTime);
    }

    useEffect(() => {
        const intervalClockTime = setInterval(() => {
            updateClock();
        }, 1000);

        return () => {
            clearInterval(intervalClockTime);
        }
    }, [])


    return (
        <div id="clock" className="text-center font-semibold text-[32px]">
            {clockTime}
        </div>
    )
}