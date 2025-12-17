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
        const { username, charName, stats, faction, isLeader } = body
        // stats = { zombiesKilled, hoursSurvived, profession, traits: [] }

        if (!username || !charName) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        // 1. Find User
        const user = await prisma.user.findUnique({
            where: { username }
        })

        if (!user) {
            // Stats came in for a user who hasn't linked yet
            return new NextResponse("User not linked/found", { status: 404 })
        }

        // --- FACTION SYNC LOGIC ---
        if (faction) {
            // Check if faction exists
            let dbFaction = await prisma.faction.findUnique({ where: { name: faction } })

            if (!dbFaction) {
                // Faction doesn't exist in DB.
                // Only create if the current user is the LEADER.
                if (isLeader) {
                    try {
                        dbFaction = await prisma.faction.create({
                            data: {
                                name: faction,
                                ownerId: user.id,
                                members: {
                                    create: {
                                        userId: user.id,
                                        role: "LEADER"
                                    }
                                }
                            }
                        })
                        console.log(`[PZ] Created new faction: ${faction} by ${username}`)
                    } catch (e) {
                        console.error(`[PZ] Failed to create faction ${faction}`, e)
                    }
                }
            } else {
                // Faction Exists. Sync Membership.
                const member = await prisma.factionMember.findUnique({
                    where: { userId: user.id }
                })

                if (member) {
                    if (member.factionId !== dbFaction.id) {
                        // User switched factions
                        await prisma.factionMember.update({
                            where: { id: member.id },
                            data: { factionId: dbFaction.id, role: isLeader ? "LEADER" : "MEMBER" }
                        })
                    } else {
                        // Same faction, check role
                        if (isLeader && member.role !== "LEADER") {
                            await prisma.factionMember.update({
                                where: { id: member.id },
                                data: { role: "LEADER" }
                            })
                            // Ensure Faction Owner is correct
                            if (dbFaction.ownerId !== user.id) {
                                await prisma.faction.update({
                                    where: { id: dbFaction.id },
                                    data: { ownerId: user.id }
                                })
                            }
                        }
                    }
                } else {
                    // Start new membership
                    await prisma.factionMember.create({
                        data: {
                            userId: user.id,
                            factionId: dbFaction.id,
                            role: isLeader ? "LEADER" : "MEMBER"
                        }
                    })
                }
            }
        }
        // --- END FACTION SYNC ---

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
