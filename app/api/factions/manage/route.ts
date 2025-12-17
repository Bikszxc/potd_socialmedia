import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { applicationId, action } = body // action: "ACCEPT" | "REJECT"

        if (!applicationId || !action) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        // 1. Fetch Application and Faction details
        const application = await prisma.factionApplication.findUnique({
            where: { id: applicationId },
            include: { faction: true, user: true } // Include user to get username for command
        })

        if (!application) {
            return new NextResponse("Application not found", { status: 404 })
        }

        // 2. Verify Requester Permissions
        const requesterMember = await prisma.factionMember.findUnique({
            where: { userId: session.user.id }
        })

        if (!requesterMember || requesterMember.factionId !== application.factionId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // Only LEADER and MODERATOR can manage
        if (requesterMember.role === "MEMBER") {
            return new NextResponse("Insufficient permissions", { status: 403 })
        }

        // 3. Perform Action
        if (action === "ACCEPT") {
            // Transaction: Add Member, Remove App, Queue Command
            await prisma.$transaction([
                // Create Member
                prisma.factionMember.create({
                    data: {
                        userId: application.userId,
                        factionId: application.factionId,
                        role: "MEMBER"
                    }
                }),
                // Delete App
                prisma.factionApplication.delete({
                    where: { id: applicationId }
                }),
                // Queue Command for Game Server
                // We need the *In-Game Username* of the applicant. 
                // The User model has `username`.
                prisma.pendingCommand.create({
                    data: {
                        type: "ADD_MEMBER",
                        // Payload format: JSON
                        payload: JSON.stringify({
                            username: application.user?.username || "Unknown",
                            faction: application.faction.name
                        })
                    }
                })
            ])

            return NextResponse.json({ success: true, message: "Member accepted and synced to game." })

        } else if (action === "REJECT") {
            await prisma.factionApplication.update({
                where: { id: applicationId },
                data: { status: "REJECTED" }
            })
            return NextResponse.json({ success: true, message: "Application rejected." })
        }

        return new NextResponse("Invalid action", { status: 400 })

    } catch (error) {
        console.error("Failed to manage faction:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
