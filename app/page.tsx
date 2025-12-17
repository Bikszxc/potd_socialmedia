"use client"

import Link from "next/link"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Image as ImageIcon, Send, User } from "lucide-react"

import { AuthScreen } from "@/components/auth/auth-screen"

export default function Home() {
  const { data: session, status } = useSession()

  // 1. Loading State
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  // 2. Unauthenticated State -> Show Auth Screen (Login Mode)
  if (status === "unauthenticated") {
    return <AuthScreen initialStep={1} />
  }

  // 3. Authenticated but Unverified -> Show Auth Screen (Verify Mode)
  if (status === "authenticated" && !session?.user?.isVerified) {
    return <AuthScreen initialStep={2} />
  }

  // Mock data for display until real data is hooked up
  const user = {
    username: session?.user?.username || "Survivor_01",
    inGameName: "Rick Grimes",
    discordName: "Rick#1234",
    faction: "The Survivors",
    friends: 12,
    marketplaceListings: 3
  }

  const posts = [
    {
      id: 1,
      author: "Governor",
      content: "Does anyone want to trade ammo for canned food? I have plenty of 9mm.",
      time: "2 hours ago",
      tags: ["Trade", "Ammo"]
    },
    {
      id: 2,
      author: "Michonne",
      content: "Found a safehouse in Muldraugh. It's clear but needs fortifications. Anyone free to help?",
      time: "5 hours ago",
      tags: ["LFG", "PVE"]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Nav would go here */}
      <header className="h-16 border-b border-border bg-card flex items-center px-8 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <h1 className="text-xl font-bold text-primary">Pinya Social</h1>
        <div className="ml-auto flex items-center gap-4">
          {/* Simple placeholder nav */}
          <Button variant="ghost">Marketplace</Button>
          <Button variant="ghost">Factions</Button>
          <Link href="/profile">
            <Avatar>
              <AvatarFallback>RG</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4 lg:p-8 flex gap-6">
        {/* Left Sidebar - Profile Summary */}
        <aside className="hidden lg:block w-[300px] shrink-0 space-y-6 sticky top-24 h-[calc(100vh-8rem)]">
          <Card className="border-border shadow-lg bg-card/50">
            <CardHeader className="text-center pb-2">
              <Avatar className="w-24 h-24 mx-auto border-4 border-primary">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="text-2xl bg-muted text-muted-foreground">{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4 text-xl">{user.username}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.inGameName}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="border-primary text-primary bg-primary/10">
                  {user.faction}
                </Badge>
              </div>

              <Separator />

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discord</span>
                  <span>{user.discordName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Friends</span>
                  <span>{user.friends}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listings</span>
                  <span>{user.marketplaceListings}</span>
                </div>
              </div>

              <Button className="w-full" variant="secondary">Edit Profile</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-none">
            <CardContent className="p-4">
              <h3 className="font-bold text-primary mb-2">Daily Survival Tip</h3>
              <p className="text-sm italic">"Always carry a can opener. Always."</p>
            </CardContent>
          </Card>
        </aside>

        {/* Center - Feed */}
        <div className="flex-1 space-y-6">
          {/* Create Post */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    placeholder="What's on your mind, survivor?"
                    className="border-none bg-muted/50 focus-visible:ring-0"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Media
                  </Button>
                </div>
                <Button size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* News / Posts Feed */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground">News Feed</h2>
            {posts.map((post) => (
              <Card key={post.id} className="border-border hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center gap-4 py-4">
                  <Avatar>
                    <AvatarFallback>{post.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-semibold text-sm">{post.author}</p>
                    <p className="text-xs text-muted-foreground">{post.time}</p>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                  <div className="flex gap-2 mt-4">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs font-normal">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Optional (Friends/Online) */}
        <aside className="hidden xl:block w-[250px] shrink-0 space-y-4">
          {/* Placeholder for future right sidebar content */}
        </aside>

      </main>
    </div>
  )
}
