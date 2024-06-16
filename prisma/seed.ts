import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient();

async function main() {
    // add a test user for development
    const password = await hash('developer', 14)

    const user = await prisma.user.upsert({
        where: { email: 'test@test.com' },
        update: {},
        create: {
            email: 'test@test.com',
            username: 'Test User',
            password: password,
            verified: true,
        }
    })

    console.log("seeding user:", user)
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
