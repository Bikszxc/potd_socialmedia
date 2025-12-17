"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function Header() {
    const { data: session } = useSession()

    return (
        <header className="h-16 border-b border-border bg-card flex items-center px-4 lg:px-8 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
            <Link href="/" className="text-xl font-bold text-primary hover:text-primary/80 transition">
                Pinya Social
            </Link>

            <div className="ml-auto flex items-center gap-4">
                <Link href="/market">
                    <Button variant="ghost">Marketplace</Button>
                </Link>
                <Link href="/factions">
                    <Button variant="ghost">Factions</Button>
                </Link>

                <Link href="/profile">
                    <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary transition">
                        {session?.user?.image ? (
                            <AvatarImage src={session.user.image} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {session?.user?.name?.[0] || session?.user?.username?.[0] || "U"}
                        </AvatarFallback>
                    </Avatar>
                </Link>
            </div>
        </header>
    )
}
