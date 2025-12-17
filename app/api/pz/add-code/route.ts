import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Simple API Key check
const API_KEY = process.env.PZ_API_KEY || "dev-secret-key"

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization")
        if (authHeader !== `Bearer ${API_KEY}`) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { username, code } = body

        if (!username || !code) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        // 10 minute expiration
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await prisma.verificationCode.upsert({
            where: { code },
            update: {
                username,
                expiresAt
            },
            create: {
                username,
                code,
                expiresAt
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to add code:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
