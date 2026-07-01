import { prisma } from './prisma';

export const generateSlug = async (title: string): Promise<string> => {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);

  let slug = base;
  let counter = 1;

  // Ensure uniqueness
  while (await prisma.trip.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
};
