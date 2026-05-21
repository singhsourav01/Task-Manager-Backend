import prisma from "../../config/prisma.config";

export class SlugService {
  static async generateSlug(
    pageName: string,
    schoolId?: string | null,
    categoryId?: string | null,
  ): Promise<string> {
    let baseSlug = pageName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // If school is selected, prepend school slug
    if (schoolId) {
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        select: { slug: true },
      });

      if (school) {
        baseSlug = `${school.slug}-${baseSlug}`;
      }
    }

    // If category is selected, prepend category slug
    if (categoryId) {
      const category = await prisma.cmsPage.findUnique({
        where: { id: categoryId },
        select: { slug: true },
      });

      if (category) {
        baseSlug = `${category.slug}-${baseSlug}`;
      }
    }

    // Ensure uniqueness
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.cmsPage.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  static async generateSchoolSlug(schoolName: string): Promise<string> {
    let baseSlug = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (await prisma.school.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
