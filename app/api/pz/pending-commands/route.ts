import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const API_KEY = process.env.PZ_API_KEY || "dev-secret-key"

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${API_KEY}`) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        // Fetch pending commands
        const commands = await prisma.pendingCommand.findMany({
            where: { processed: false },
            orderBy: { createdAt: 'asc' }
        })

        // Return them
        return NextResponse.json(commands)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch commands" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    // Ack mechanism: Bridge sends back IDs of processed commands
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${API_KEY}`) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { commandIds } = body

        if (Array.isArray(commandIds) && commandIds.length > 0) {
            await prisma.pendingCommand.updateMany({
                where: { id: { in: commandIds } },
                data: { processed: true }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to ack commands" }, { status: 500 })
    }
}
