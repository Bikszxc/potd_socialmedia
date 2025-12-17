
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    // 1. Reset all users to unverified
    await prisma.user.updateMany({
        data: {
            isVerified: false,
            username: null, // Clear the linked in-game username
        },
    })

    console.log("All users have been unverified and unlinked.")

    // 2. Ensure the test code exists
    const code = "123456"
    const username = "Rick Grimes"

    // Clean up existing code if any (just in case)
    try {
        await prisma.verificationCode.delete({
            where: { code }
        })
    } catch (e) { }

    await prisma.verificationCode.create({
        data: {
            code,
            username,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        },
    })

    console.log(`Reseeded code: ${code} -> ${username}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
