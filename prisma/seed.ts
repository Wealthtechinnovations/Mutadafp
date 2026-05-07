import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const superAdminPass = await bcrypt.hash("Azer102385@@", 10);
  const adminPass = await bcrypt.hash("admin123", 10);

  // Super Admin requested by user
  await prisma.user.upsert({
    where: { email: "diby_eric@yahoo.fr" },
    update: { password: superAdminPass },
    create: {
      email: "diby_eric@yahoo.fr",
      password: superAdminPass,
      firstName: "Eric",
      lastName: "Diby",
      country: "Côte d'Ivoire",
      birthDate: new Date("1975-01-01"),
      role: "SUPER_ADMIN",
      isEmailVerified: true,
    },
  });

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@collectif.org" },
    update: {},
    create: {
      email: "admin@collectif.org",
      password: adminPass,
      firstName: "Admin",
      lastName: "User",
      country: "Côte d'Ivoire",
      birthDate: new Date("1985-01-01"),
      role: "ADMIN",
      isEmailVerified: true,
    },
  });

  // Sample User
  const user = await prisma.user.upsert({
    where: { email: "victime1@example.com" },
    update: {},
    create: {
      email: "victime1@example.com",
      password: adminPass,
      firstName: "Jean",
      lastName: "Dupont",
      country: "Côte d'Ivoire",
      birthDate: new Date("1990-05-15"),
      role: "USER",
      isEmailVerified: true,
    },
  });

  // Sample Dossier
  await prisma.dossier.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      status: "SOUMIS",
      facts: "J'ai versé 5.000.000 XOF pour un terrain à Bingerville en 2021. Je n'ai jamais reçu les documents de propriété malgré mes relances.",
      totalAmount: 5000000,
      submittedAt: new Date(),
      completenessScore: 80,
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
