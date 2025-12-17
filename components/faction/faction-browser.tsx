"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Users } from "lucide-react"

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
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    function openApply(id: string) {
        setSelectedFaction(id)
        setIsDialogOpen(true)
    }

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
                setIsDialogOpen(false)
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Browse Factions</h2>
                    <p className="text-muted-foreground">Join a group to survive together.</p>
                </div>
                {/* Maybe a 'Create Faction' button here in the future? */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {factions.map(f => (
                    <Card key={f.id} className="flex flex-col hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Shield className="w-8 h-8 text-primary mb-2" />
                                <Badge variant="secondary" className="bg-secondary/50">
                                    <Users className="w-3 h-3 mr-1" />
                                    {f._count.members}
                                </Badge>
                            </div>
                            <CardTitle>{f.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {f.description || "No description provided."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {/* Additional stats or info could go here */}
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => openApply(f.id)}>
                                Apply to Join
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Apply to {factions.find(f => f.id === selectedFaction)?.name}</DialogTitle>
                        <DialogDescription>
                            Tell the leaders why you would be a good addition to their ranks.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="I have 500 hours survived and I'm a master carpenter..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleApply} disabled={isApplying}>
                            {isApplying ? "Sending..." : "Send Application"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
