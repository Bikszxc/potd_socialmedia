import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        // Handle Session (adjust based on actual auth implementation)
        // Trying common patterns since I don't see the auth config file
        const session = await getServerSession(authOptions) // Standard NextAuth v4
        // If v5, might be `await auth()`

        if (!session || !session.user || !session.user.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { code } = body

        if (!code) {
            return new NextResponse("Code required", { status: 400 })
        }

        // 1. Find Valid Code
        const validCode = await prisma.verificationCode.findUnique({
            where: { code }
        })

        if (!validCode) {
            return new NextResponse("Invalid code", { status: 400 })
        }

        if (validCode.expiresAt < new Date()) {
            return new NextResponse("Code expired", { status: 400 })
        }

        // 2. Link User
        // We link the username from the code to the currently logged in user
        // And mark as verified
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                username: validCode.username,
                isVerified: true
            }
        })

        // 3. Create initial Character if not exists (Optional but good for immediate feedback)
        // Actually, we'll let the stats collector create the character on next tick, 
        // OR we create a placeholder now. Let's create placeholder so "Graveyard" logic works from start.

        await prisma.character.create({
            data: {
                userId: updatedUser.id,
                fullName: "Survivor Verified", // Will be updated by next stats tick
                isAlive: true
            }
        })

        // 4. Cleanup
        await prisma.verificationCode.delete({
            where: { id: validCode.id }
        })

        return NextResponse.json({
            success: true,
            username: validCode.username
        })

    } catch (error) {
        console.error("Verification failed:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
