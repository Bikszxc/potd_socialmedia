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
        const { factionId, message } = body

        if (!factionId) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        // Check if already in a faction
        const existingMember = await prisma.factionMember.findUnique({
            where: { userId: session.user.id }
        })

        if (existingMember) {
            return new NextResponse("Already in a faction", { status: 400 })
        }

        // Check if pending application exists
        const existingApp = await prisma.factionApplication.findFirst({
            where: {
                userId: session.user.id,
                status: "PENDING"
            }
        })

        if (existingApp) {
            return new NextResponse("Application already pending", { status: 400 })
        }

        await prisma.factionApplication.create({
            data: {
                userId: session.user.id,
                factionId,
                message,
                status: "PENDING"
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Failed to apply:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
