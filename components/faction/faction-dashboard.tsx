"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface User {
    username: string | null
    image: string | null
}

interface Member {
    id: string
    role: "LEADER" | "MODERATOR" | "MEMBER"
    user: User
    joinedAt: Date
}

interface Application {
    id: string
    status: string
    message: string | null
    user: User
    createdAt: Date
}

interface FactionData {
    id: string
    name: string
    description: string | null
    members: Member[]
    applications: Application[]
}

export default function FactionDashboard({ faction, role }: { faction: FactionData, role: string }) {
    const router = useRouter()
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const canManage = role === "LEADER" || role === "MODERATOR"

    async function handleAppAction(id: string, action: "ACCEPT" | "REJECT") {
        setActionLoading(id)
        try {
            const res = await fetch("/api/factions/manage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ applicationId: id, action })
            })
            if (!res.ok) {
                alert("Failed: " + await res.text())
            } else {
                router.refresh()
            }
        } catch (e) {
            alert("Error")
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div className="space-y-8">
            <div className="border-b border-zinc-800 pb-4">
                <h1 className="text-4xl font-extrabold text-white mb-2">{faction.name}</h1>
                <p className="text-zinc-400">{faction.description || "No description set."}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Roster */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
                        Roster
                    </h2>
                    <div className="space-y-2">
                        {faction.members.map(m => (
                            <div key={m.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded border border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                                        {m.user.username?.[0] || "?"}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{m.user.username || "Unknown"}</div>
                                        <div className="text-xs text-zinc-500">Joined {new Date(m.joinedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded bg-zinc-800 border ${m.role === "LEADER" ? "border-amber-500/50 text-amber-500" :
                                        m.role === "MODERATOR" ? "border-blue-500/50 text-blue-500" :
                                            "border-zinc-700 text-zinc-400"
                                    }`}>
                                    {m.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Management Column */}
                <div className="space-y-6">
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <h3 className="font-bold text-zinc-300 mb-2">My Status</h3>
                        <div className="text-sm text-zinc-400">Role: <span className="text-white">{role}</span></div>
                    </div>

                    {canManage && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white">Pending Applications</h2>
                            {faction.applications.length === 0 ? (
                                <p className="text-zinc-500 text-sm">No pending applications.</p>
                            ) : (
                                <div className="space-y-2">
                                    {faction.applications.map(app => (
                                        <div key={app.id} className="p-3 bg-zinc-800/50 rounded border border-zinc-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-white">{app.user.username}</span>
                                                <span className="text-xs text-zinc-500">{new Date(app.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 mb-3 italic">"{app.message || "No message"}"</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAppAction(app.id, "ACCEPT")}
                                                    disabled={!!actionLoading}
                                                    className="flex-1 bg-green-900/30 text-green-400 border border-green-900 hover:bg-green-900/50 py-1 rounded text-xs transition"
                                                >
                                                    {actionLoading === app.id ? "..." : "Accept"}
                                                </button>
                                                <button
                                                    onClick={() => handleAppAction(app.id, "REJECT")}
                                                    disabled={!!actionLoading}
                                                    className="flex-1 bg-red-900/30 text-red-400 border border-red-900 hover:bg-red-900/50 py-1 rounded text-xs transition"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
