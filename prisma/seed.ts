import { PrismaClient } from "@prisma/client";

import products from "../src/utils/data/products";
import { hashPassword } from "../src/lib/passwords";

const prisma = new PrismaClient();

const seed = async () => {
    for (const product of products) {
        await prisma.product.upsert({
            where: { id: product.id },
            update: {
                name: product.name,
                category: product.category,
                price: Math.round(product.price * 100),
                currentPrice: Math.round(product.currentPrice * 100),
                discount: product.discount ?? null,
                quantityAvailable: product.quantityAvailable,
                images: JSON.stringify(product.images),
                sizes: JSON.stringify(product.sizes),
                colors: JSON.stringify(product.colors),
                punctuation: JSON.stringify(product.punctuation),
                reviews: JSON.stringify(product.reviews),
            },
            create: {
                id: product.id,
                name: product.name,
                category: product.category,
                price: Math.round(product.price * 100),
                currentPrice: Math.round(product.currentPrice * 100),
                discount: product.discount ?? null,
                quantityAvailable: product.quantityAvailable,
                images: JSON.stringify(product.images),
                sizes: JSON.stringify(product.sizes),
                colors: JSON.stringify(product.colors),
                punctuation: JSON.stringify(product.punctuation),
                reviews: JSON.stringify(product.reviews),
            },
        });
    }

    await prisma.user.upsert({
        where: { email: "demo@modalane.test" },
        update: {},
        create: {
            email: "demo@modalane.test",
            firstName: "Demo",
            lastName: "Customer",
            passwordHash: hashPassword("modalane-demo"),
        },
    });
};

seed()
    .then(async () => prisma.$disconnect())
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
