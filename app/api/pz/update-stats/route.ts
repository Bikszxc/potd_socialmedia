import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const API_KEY = process.env.PZ_API_KEY || "dev-secret-key"

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization")
        if (authHeader !== `Bearer ${API_KEY}`) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { username, charName, stats } = body
        // stats = { zombiesKilled, hoursSurvived, profession, traits: [] }

        if (!username || !charName) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        // 1. Find User
        const user = await prisma.user.findUnique({
            where: { username }
        })

        if (!user) {
            // Stats came in for a user who hasn't linked yet?
            // Optionally we could create a user placeholder, but for now we ignore.
            return new NextResponse("User not linked/found", { status: 404 })
        }

        // 2. Find ACTIVE Character for this user
        const activeChar = await prisma.character.findFirst({
            where: {
                userId: user.id,
                isAlive: true
            }
        })

        // 3. Logic: Match Names
        if (activeChar) {
            if (activeChar.fullName !== charName) {
                // NAME MISMATCH => DEATH EVENT DETECTED
                console.log(`[PZ] Death Detected for ${user.username}. Old: ${activeChar.fullName}, New: ${charName}`)

                // Kill old char
                await prisma.character.update({
                    where: { id: activeChar.id },
                    data: {
                        isAlive: false,
                        diedAt: new Date()
                    }
                })

                // Create new char
                await prisma.character.create({
                    data: {
                        userId: user.id,
                        fullName: charName,
                        isAlive: true,
                        zombiesKilled: stats.zombiesKilled || 0,
                        hoursSurvived: stats.hoursSurvived || 0,
                        profession: stats.profession || null,
                        traits: stats.traits || []
                        // bornAt default now
                    }
                })
            } else {
                // SAME CHAR => UPDATE STATS
                await prisma.character.update({
                    where: { id: activeChar.id },
                    data: {
                        zombiesKilled: stats.zombiesKilled || 0,
                        hoursSurvived: stats.hoursSurvived || 0,
                        profession: stats.profession || null,
                        traits: stats.traits || []
                    }
                })
            }
        } else {
            // No active character found? Create first one.
            await prisma.character.create({
                data: {
                    userId: user.id,
                    fullName: charName,
                    isAlive: true,
                    zombiesKilled: stats.zombiesKilled || 0,
                    hoursSurvived: stats.hoursSurvived || 0,
                    profession: stats.profession || null,
                    traits: stats.traits || []
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to update stats:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
