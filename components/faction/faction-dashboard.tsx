"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Users, Clock, Crown, ShieldAlert } from "lucide-react"

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
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-card">
                <div className="h-32 bg-gradient-to-r from-red-900/20 to-slate-900/50 absolute inset-0" />
                <div className="relative p-6 lg:p-8 flex items-end gap-6">
                    <div className="h-24 w-24 rounded-xl bg-background border-4 border-background flex items-center justify-center shadow-xl">
                        <Shield className="h-12 w-12 text-primary" />
                    </div>
                    <div className="mb-2">
                        <h1 className="text-3xl font-extrabold tracking-tight">{faction.name}</h1>
                        <p className="text-muted-foreground">{faction.description || "We survive together."}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Roster */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Roster
                            </CardTitle>
                            <CardDescription>
                                {faction.members.length} Active Members
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {faction.members.map(m => (
                                <div key={m.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={m.user.image || "/placeholder-avatar.jpg"} />
                                            <AvatarFallback>{m.user.username?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold">{m.user.username}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Joined {new Date(m.joinedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={m.role === "LEADER" ? "default" : m.role === "MODERATOR" ? "secondary" : "outline"}
                                        className={m.role === "LEADER" ? "bg-amber-600 hover:bg-amber-700" : ""}
                                    >
                                        {m.role === "LEADER" && <Crown className="w-3 h-3 mr-1" />}
                                        {m.role === "MODERATOR" && <ShieldAlert className="w-3 h-3 mr-1" />}
                                        {m.role}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Info & Management */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                                <span className="text-sm text-muted-foreground">Current Role</span>
                                <Badge>{role}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {canManage && (
                        <Card className="border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-lg">Applications ({faction.applications.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {faction.applications.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-4 text-sm">
                                        No pending applications.
                                    </div>
                                ) : (
                                    faction.applications.map(app => (
                                        <div key={app.id} className="bg-muted/30 p-4 rounded-lg space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{app.user.username?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-sm">{app.user.username}</div>
                                                    <div className="text-xs text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <p className="text-sm italic text-muted-foreground pl-2 border-l-2 border-primary/20">
                                                "{app.message || "No message"}"
                                            </p>
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handleAppAction(app.id, "ACCEPT")}
                                                    disabled={!!actionLoading}
                                                >
                                                    {actionLoading === app.id ? "..." : "Accept"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="w-full"
                                                    onClick={() => handleAppAction(app.id, "REJECT")}
                                                    disabled={!!actionLoading}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
