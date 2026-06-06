"use client"
import React, { PropsWithChildren } from 'react'
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { ThemeProvider } from '@/contexts/theme-context'

const queryClient = new QueryClient()
export default function Providers({ children }: PropsWithChildren) {
    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </ThemeProvider>
    )
}