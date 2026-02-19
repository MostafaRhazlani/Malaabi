import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: pool });

async function main() {

  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      email: "admin@gmail.com",
      first_name: "Admin",
      last_name: "System",
      password: "password",
      role: "ADMIN",
    },
  });
  console.log("Admin created successfully");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });