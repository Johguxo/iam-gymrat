import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  for (let day = 0; day < 7; day++) {
    await prisma.routineDay.upsert({
      where: { dayOfWeek: day },
      update: {},
      create: { dayOfWeek: day, muscleGroups: [] },
    });
  }
  console.log("Seeded routine days 0-6");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
