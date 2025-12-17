"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Faction {
    id: string
    name: string
    description: string | null
    _count: {
        members: number
    }
}

export default function FactionBrowser({ factions }: { factions: Faction[] }) {
    const router = useRouter()
    const [selectedFaction, setSelectedFaction] = useState<string | null>(null)
    const [message, setMessage] = useState("")
    const [isApplying, setIsApplying] = useState(false)

    async function handleApply() {
        if (!selectedFaction) return
        setIsApplying(true)

        try {
            const res = await fetch("/api/factions/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ factionId: selectedFaction, message })
            })

            if (!res.ok) {
                const txt = await res.text()
                alert("Failed to apply: " + txt)
            } else {
                alert("Application sent!")
                setSelectedFaction(null)
                setMessage("")
                router.refresh()
            }
        } catch (e) {
            alert("Error applying")
        } finally {
            setIsApplying(false)
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
                Browse Factions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {factions.map(f => (
                    <div key={f.id} className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 transition flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{f.name}</h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                {f.description || "No description provided."}
                            </p>
                            <div className="text-xs text-zinc-500">
                                {f._count.members} Members
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedFaction(f.id)}
                            className="mt-4 w-full bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-600/50 py-2 rounded transition"
                        >
                            Apply to Join
                        </button>
                    </div>
                ))}
            </div>

            {selectedFaction && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-lg max-w-md w-full space-y-4">
                        <h3 className="text-xl font-bold">Apply to {factions.find(f => f.id === selectedFaction)?.name}</h3>
                        <textarea
                            className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white"
                            placeholder="Why should we accept you?"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedFaction(null)}
                                className="px-4 py-2 hover:bg-zinc-800 rounded text-zinc-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={isApplying}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {isApplying ? "Sending..." : "Send Application"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
