"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    // Mock data fetching based on id
    const user = {
        username: "Rick Grimes",
        role: "Leader",
        bio: "Looking for my family. And also supplies.",
        location: "Prison",
        level: 10,
        stats: {
            zombiesKilled: 1402,
            daysSurvived: 45,
        }
    }

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-8">
            {/* Profile Header */}
            <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-muted">
                {/* Banner Image Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-background flex items-center justify-center text-muted-foreground">
                    Cover Image
                </div>

                <div className="absolute -bottom-12 left-8 flex items-end">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-xl">
                        <AvatarFallback className="text-4xl">RG</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Info Column */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">{user.username}</h1>
                        <Badge variant="secondary">{user.role}</Badge>
                        <p className="text-muted-foreground">{user.bio}</p>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Location</span>
                            <span>{user.location}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Level</span>
                            <span>{user.level}</span>
                        </div>
                    </div>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4 space-y-2">
                            <h4 className="font-semibold text-primary">In-Game Stats</h4>
                            <div className="flex justify-between text-sm">
                                <span>Zombies Killed</span>
                                <span className="font-mono">{user.stats.zombiesKilled}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Days Survived</span>
                                <span className="font-mono">{user.stats.daysSurvived}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content Column */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="posts">
                        <TabsList>
                            <TabsTrigger value="posts">Posts</TabsTrigger>
                            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                            <TabsTrigger value="friends">Friends</TabsTrigger>
                        </TabsList>
                        <TabsContent value="posts" className="mt-6 space-y-4">
                            {/* Mock Posts */}
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">No posts yet.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="marketplace" className="mt-6">
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Active Listings: 0</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
