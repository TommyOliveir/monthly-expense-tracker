import { PrismaClient } from '../generated/prisma';


const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Markets & dining', color: '#c96f4a', initial: 'G', isDefault: true },
  { name: 'Subscriptions', color: '#d99a3d', initial: 'S', isDefault: true },
  { name: 'Housing', color: '#7d8c5c', initial: 'U', isDefault: true },
  { name: 'Transport', color: '#8c6a54', initial: 'T', isDefault: true },
];

async function main() {
  console.log('Seeding default categories...');

  for (const category of defaultCategories) {
    // Find existing global default by name or create it
    const existing = await prisma.category.findFirst({
      where: {
        name: category.name,
        userId: null,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          ...category,
          userId: null, // Global default categories have no user attached
        },
      });
    }
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });