"use server";

import { sorted_arrivals } from "@/constants";

export async function getArrivals() {
    return {
        stops: sorted_arrivals
    }
}

export async function updateArrivals() {

}