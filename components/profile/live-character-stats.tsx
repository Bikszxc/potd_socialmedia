"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trophy, Activity, Skull, Clock } from "lucide-react"

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function LiveCharacterStats() {
    // Poll every 5 seconds
    const { data: character, error } = useSWR("/api/user/active-character", fetcher, {
        refreshInterval: 5000,
        revalidateOnFocus: true
    })

    if (error) return <div className="text-red-500 text-sm">Failed to load live stats</div>
    if (!character) return <div className="text-muted-foreground text-sm animate-pulse">Connecting to PZ Satellite...</div>

    const isAlive = character.status === "ALIVE"

    return (
        <Card className={`relative overflow-hidden transition-colors ${!isAlive ? "border-red-900/50 bg-red-950/10" : ""}`}>
            {/* Pulsing Dot for Live Status */}
            {isAlive && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-mono text-green-500 font-bold uppercase">LIVE FEED</span>
                </div>
            )}

            {!isAlive && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <Skull className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-mono text-red-600 font-bold uppercase">SIGNAL LOST (DECEASED)</span>
                </div>
            )}

            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className={`w-5 h-5 ${isAlive ? "text-green-500" : "text-red-500"}`} />
                    {character.fullName || "Unknown Survivor"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <Skull className="w-4 h-4" /> Zombies Neutralized
                    </span>
                    <span className="font-bold text-lg font-mono">{character.zombiesKilled ?? 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Time Survived
                    </span>
                    <span className="font-bold text-lg font-mono">{(character.hoursSurvived ?? 0).toFixed(1)}h</span>
                </div>
                {character.profession && (
                    <>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Profession</span>
                            <span className="font-bold text-sm uppercase">{character.profession}</span>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
