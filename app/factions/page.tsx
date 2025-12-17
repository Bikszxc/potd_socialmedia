import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import FactionDashboard from "@/components/faction/faction-dashboard"
import FactionBrowser from "@/components/faction/faction-browser"

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

    if (membership && membership.faction) {
        // User is in a faction. Show Dashboard.
        // Transform Dates to strings/ISO if needed for Client Component serialization?
        // Server Components pass Dates fine now usually, but let's be safe if issues arise.
        // Actually Next.js 13+ passes Dates fine.

        return (
            <div className="container mx-auto px-4 py-8">
                <FactionDashboard faction={membership.faction} role={membership.role} />
            </div>
        )
    }

    // User is NOT in a faction. Show Browser.
    const factions = await prisma.faction.findMany({
        include: {
            _count: { select: { members: true } }
        },
        orderBy: { members: { _count: "desc" } }
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <FactionBrowser factions={factions} />
        </div>
    )
}
