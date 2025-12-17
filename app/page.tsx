import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AuthScreen } from "@/components/auth/auth-screen"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Image as ImageIcon, Send } from "lucide-react"
import { Header } from "@/components/layout/header"

export default async function Home() {
  const session = await getServerSession(authOptions)

  // 1. Unauthenticated -> Show Auth Screen
  if (!session || !session.user) {
    return <AuthScreen initialStep={1} />
  }

  // 2. Unverified -> Show Auth Screen (Verify Mode)
  // We need to fetch the fresh user data to know isVerified status reliably
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      characters: {
        where: { isAlive: true }
      },
      factionJoined: {
        include: { faction: true }
      }
    }
  })

  if (!dbUser) return <div>User not found</div>

  if (!dbUser.isVerified) {
    return <AuthScreen initialStep={2} />
  }

  // 3. Authenticated & Verified -> Show Dashboard
  const activeChar = dbUser.characters[0]

  const userDisplay = {
    username: dbUser.username || dbUser.name || "Survivor",
    inGameName: activeChar ? activeChar.fullName : "No Active Character",
    discordName: dbUser.discordId || "Not Linked", // Discord ID is usually the snowflake, but if we stored the tag, use that. 
    // Wait, typical Discord Oauth stores ID. If we want tag we need to fetch it or have stored it. 
    // For now showing ID or just "Linked" is better than placeholder.
    faction: dbUser.factionJoined?.faction.name || "No Faction",
    image: session.user.image,
    // Placeholders for now
    friends: 0,
    marketplaceListings: 0
  }

  // Mock Posts (To be replaced later)
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
      <Header />

      <main className="container mx-auto p-4 lg:p-8 flex gap-6">
        {/* Left Sidebar - Profile Summary */}
        <aside className="hidden lg:block w-[300px] shrink-0 space-y-6 sticky top-24 h-[calc(100vh-8rem)]">
          <Card className="border-border shadow-lg bg-card/50">
            <CardHeader className="text-center pb-2">
              <Avatar className="w-24 h-24 mx-auto border-4 border-primary">
                <AvatarImage src={userDisplay.image || "/placeholder-avatar.jpg"} />
                <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
                  {userDisplay.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4 text-xl">{userDisplay.username}</CardTitle>
              <p className="text-sm text-muted-foreground">{userDisplay.inGameName}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="border-primary text-primary bg-primary/10">
                  {userDisplay.faction}
                </Badge>
              </div>

              <Separator />

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  {/* Truncate Discord ID if too long */}
                  <span className="text-muted-foreground">Discord</span>
                  <span title={userDisplay.discordName} className="truncate max-w-[150px]">
                    {userDisplay.discordName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Friends</span>
                  <span>{userDisplay.friends}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listings</span>
                  <span>{userDisplay.marketplaceListings}</span>
                </div>
              </div>

              <Link href="/profile" className="block w-full">
                <Button className="w-full" variant="secondary">Edit Profile</Button>
              </Link>
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
                  <AvatarFallback>{userDisplay.username.slice(0, 2).toUpperCase()}</AvatarFallback>
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
