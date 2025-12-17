
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const code = "123456"
    const username = "Rick Grimes"

    // Clean up existing code if any
    try {
        await prisma.verificationCode.delete({
            where: { code }
        })
    } catch (e) { }

    const verificationCode = await prisma.verificationCode.create({
        data: {
            code,
            username,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        },
    })

    console.log(`Created verification code: ${verificationCode.code} for user: ${verificationCode.username}`)
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
