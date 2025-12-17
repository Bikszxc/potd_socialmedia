"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Users, Trophy, Activity, Terminal, Wifi, Signal } from "lucide-react"

interface ServerStats {
    online: boolean
    players: number
    maxPlayers: number
    ping: number
    name: string
}

export function ServerShowcase() {
    const [logs, setLogs] = useState<string[]>([
        "Initializing visuals...",
        "Connecting to PinyaNet...",
    ])

    const [stats, setStats] = useState<ServerStats>({
        online: false,
        players: 0,
        maxPlayers: 0,
        ping: 0,
        name: "Connecting..."
    })

    // Fetch server stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/server-status')
                const data = await res.json()
                if (data.online) {
                    setStats(data)
                }
            } catch (error) {
                console.error("Failed to fetch stats", error)
            }
        }

        // Initial fetch
        fetchStats()

        // Poll every 30 seconds
        const interval = setInterval(fetchStats, 30000)
        return () => clearInterval(interval)
    }, [])

    // Simulate "live" terminal feed
    useEffect(() => {
        const messages = [
            "Scanning sector 7...",
            "Horde movement detected in Muldraugh.",
            "Supply drop incoming...",
            "Signal intercepted: 'Help us...'",
            "Firewall integrity: 98%",
            "New survivor registered.",
            "Weather alert: Heavy fog approaching.",
            "Broadcast tower active.",
        ]

        const interval = setInterval(() => {
            const randomMsg = messages[Math.floor(Math.random() * messages.length)]
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false })
            setLogs(prev => [`[${timestamp}] ${randomMsg}`, ...prev].slice(0, 6))
        }, 2500)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative h-full w-full overflow-hidden bg-background/95 text-foreground flex flex-col justify-center p-8 border-r border-border">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <motion.div
                    animate={{ top: ["0%", "100%"] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute w-full h-[2px] bg-primary/50 shadow-[0_0_20px_2px_var(--primary)]"
                />
            </div>

            <div className="relative z-10 space-y-12">
                {/* Header */}
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono border border-primary/20"
                    >
                        <Wifi className="w-3 h-3 animate-pulse" />
                        <span>SIGNAL_STRENGTH: STRONG</span>
                    </motion.div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary/50 drop-shadow-sm">
                        Pinya<br />Social
                        <span className="text-primary text-lg ml-2 align-top">v2.0</span>
                    </h1>
                    <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
                        The ultimate tactical network for the apocalypse. Trade, organize, and survive.
                    </p>
                </div>

                {/* Floating Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        icon={Users}
                        label="Survivors Online"
                        value={stats.players.toString()}
                        trend={`/${stats.maxPlayers || '---'} Cap`}
                        delay={0.1}
                    />
                    <StatCard
                        icon={Activity}
                        label="Server Status"
                        value={stats.online ? "ONLINE" : "OFFLINE"}
                        trend="Pinya of The Dead"
                        delay={0.2}
                    />
                    <StatCard
                        icon={Signal}
                        label="Latency"
                        value={`${stats.ping}ms`}
                        trend={stats.ping < 100 ? "Good Connection" : "Unstable"}
                        delay={0.3}
                    />
                    <StatCard
                        icon={Trophy}
                        label="Current Season"
                        value="New Frontier"
                        trend="Season 4"
                        delay={0.4}
                    />
                </div>

                {/* Live Terminal */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                    <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                            <Terminal className="w-4 h-4" />
                            <span>SYSTEM_LOGS.log</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                            <div className="w-2 h-2 rounded-full bg-green-500/50" />
                        </div>
                    </div>
                    <div className="p-4 font-mono text-xs space-y-2 h-[150px] overflow-hidden relative [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
                        <AnimatePresence initial={false} mode="popLayout">
                            {logs.map((log, i) => (
                                <motion.p
                                    layout
                                    key={`${log}-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-primary/80 relative z-0"
                                >
                                    <span className="text-muted-foreground opacity-50 mr-2">{">"}</span>
                                    {log}
                                </motion.p>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, trend, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
            className="p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group cursor-default"
        >
            <div className="flex items-start justify-between mb-2">
                <Icon className="w-5 h-5 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{trend}</span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {value}
            </div>
            <div className="text-xs text-muted-foreground font-medium">{label}</div>
        </motion.div>
    )
}
