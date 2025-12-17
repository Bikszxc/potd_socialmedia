import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        // Fetch active character
        let character = await prisma.character.findFirst({
            where: {
                userId: session.user.id,
                isAlive: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        // If no active character, check if they have ANY character (maybe they just died)
        // so we can show "Status: Deceased" instead of nothing.
        if (!character) {
            const lastDeadChar = await prisma.character.findFirst({
                where: {
                    userId: session.user.id,
                    isAlive: false
                },
                orderBy: {
                    diedAt: 'desc'
                }
            })

            if (lastDeadChar) {
                return NextResponse.json({ ...lastDeadChar, status: "DEAD" })
            }

            return NextResponse.json(null) // No characters at all
        }

        return NextResponse.json({ ...character, status: "ALIVE" })
    } catch (error) {
        console.error("Failed to fetch active character:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
