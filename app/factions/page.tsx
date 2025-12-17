import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import FactionDashboard from "@/components/faction/faction-dashboard"
import FactionBrowser from "@/components/faction/faction-browser"
import { Header } from "@/components/layout/header"

export default async function FactionPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/auth/signin")
    }

    // Check membership
    const membership = await prisma.factionMember.findUnique({
        where: { userId: session.user.id },
        include: {
            faction: {
                include: {
                    members: {
                        include: { user: { select: { username: true, image: true } } },
                        orderBy: { joinedAt: "desc" }
                    },
                    applications: {
                        where: { status: "PENDING" },
                        include: { user: { select: { username: true, image: true } } },
                        orderBy: { createdAt: "desc" }
                    }
                }
            }
        }
    })

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <div className="container mx-auto px-4 py-8">
                {membership && membership.faction ? (
                    <FactionDashboard faction={membership.faction} role={membership.role} />
                ) : (
                    // Refetch factions for the browser if not in one
                    // We can do this inline since it's a Server Component
                    // But wait, we need to pass data.
                    // Let's optimize: fetch factions only if needed.
                    <BrowserWrapper />
                )}
            </div>
        </div>
    )
}

// Helper component to fetch data for the browser part
async function BrowserWrapper() {
    const factions = await prisma.faction.findMany({
        include: {
            _count: { select: { members: true } }
        },
        orderBy: { members: { _count: "desc" } }
    })

    return <FactionBrowser factions={factions} />
}
