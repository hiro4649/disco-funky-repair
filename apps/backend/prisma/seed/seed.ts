import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash(`${process.env.ADMIN_PASSWORD}`, 10);

    // Check if an admin with the given email already exists
    const existingAdmin = await prisma.admin.findUnique({
        where: { email: process.env.ADMIN_EMAIL }
    });

    if (!existingAdmin) {
        // Only create a new admin if one doesn't already exist
        const admin = await prisma.admin.create({
            data: {
                email: process.env.ADMIN_EMAIL!,
                password_hash: hashedPassword,
            },
        });
        await prisma.airdropTokens.create({
            data: {
                userId: admin.id,
                balance: 10000
            }
        })
        console.log('Admin created successfully');
    } else {
        console.log('Admin already exists');
        await prisma.airdropTokens.create({
            data: {
                userId: existingAdmin.id,
                balance: 10000
            }
        })
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });