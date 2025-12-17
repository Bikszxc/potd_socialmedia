"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Shield, Swords, Trophy, Users } from "lucide-react"
import { LiveCharacterStats } from "@/components/profile/live-character-stats"

export default function ProfilePage() {
    // Mock User Data
    const user = {
        username: "Survivor_01",
        inGameName: "Rick Grimes",
        discordName: "Rick#1234",
        faction: "The Survivors",
        joinDate: "Oct 2024",
        location: "Muldraugh",
        role: "Leader",
        stats: {
            zombiesKilled: 1243,
            daysSurvived: 45,
            hoursPlayed: 120
        }
    }

    // Mock Posts Data
    const posts = [
        {
            id: 1,
            content: "Just finished fortifying the gas station. It's safe for now!",
            time: "2 days ago",
            likes: 15,
            comments: 3
        },
        {
            id: 2,
            content: "Does anyone have a spare generator manual? willing to trade.",
            time: "5 days ago",
            likes: 8,
            comments: 7
        }
    ]

    return (
        <div className="container mx-auto p-4 lg:p-8 space-y-8">
            {/* Profile Header */}
            <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                {/* Cover Image Placeholder */}
                <div className="h-48 bg-gradient-to-r from-slate-900 to-slate-800 relative">
                    <div className="absolute inset-0 bg-black/20" />
                </div>

                <CardContent className="relative pt-0 px-8 pb-8">
                    {/* Avatar - overlaps cover */}
                    <div className="flex flex-col md:flex-row gap-6 items-start -mt-16">
                        <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                            <AvatarImage src="/placeholder-avatar.jpg" />
                            <AvatarFallback className="text-4xl">RG</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 mt-16 md:mt-2 space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold">{user.username}</h1>
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        {user.inGameName}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button>Add Friend</Button>
                                    <Button variant="outline">Message</Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                                    <Users className="w-3 h-3 mr-1" />
                                    {user.faction}
                                </Badge>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {user.location}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Joined {user.joinDate}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Stats & Info */}
                <div className="space-y-6">
                    {/* Live Stats Component Replacement */}
                    <LiveCharacterStats />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">About</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-muted-foreground">Discord</span>
                                <span className="font-mono text-xs bg-muted p-1 rounded text-center">{user.discordName}</span>

                                <span className="text-muted-foreground">Role</span>
                                <span>{user.role}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Tabs (Posts, Marketplace, etc) */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="posts" className="w-full">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="posts">Posts</TabsTrigger>
                            <TabsTrigger value="media">Media</TabsTrigger>
                            <TabsTrigger value="marketplace">Marketplace Listings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="posts" className="space-y-4 mt-6">
                            {posts.map((post) => (
                                <Card key={post.id}>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src="/placeholder-avatar.jpg" />
                                            <AvatarFallback>RG</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold">{user.username}</h4>
                                            <p className="text-xs text-muted-foreground">{post.time}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{post.content}</p>
                                    </CardContent>
                                    <div className="px-6 pb-4 flex gap-4 text-sm text-muted-foreground">
                                        <span className="hover:text-primary cursor-pointer">Like ({post.likes})</span>
                                        <span className="hover:text-primary cursor-pointer">Comment ({post.comments})</span>
                                    </div>
                                </Card>
                            ))}
                        </TabsContent>

                        <TabsContent value="media">
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    No media uploaded yet.
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="marketplace">
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    No active listings over the radio frequency.
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
