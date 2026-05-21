import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCategories() {
  const categories = [
    {
      name: "Home",
      slug: "home",
      description: "University home page and introduction",
      pageOrder: 1,
      isActive: true,
    },
    {
      name: "About Us",
      slug: "about-us",
      description: "About JSPM University, history, mission and vision",
      pageOrder: 2,
      isActive: true,
    },
    {
      name: "Academics",
      slug: "academics",
      description: "Academic programs, courses and curriculum",
      pageOrder: 3,
      isActive: true,
    },
    {
      name: "Research",
      slug: "research",
      description: "Research initiatives, publications and innovations",
      pageOrder: 4,
      isActive: true,
    },
    {
      name: "Admission",
      slug: "admission",
      description: "Admission process, requirements and deadlines",
      pageOrder: 5,
      isActive: true,
    },
  ];

  for (const category of categories) {
    await prisma.pageCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log("✅ Categories seeded successfully");
}

async function main() {
  try {
    await seedCategories();
    console.log("🌱 Seeding completed");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
