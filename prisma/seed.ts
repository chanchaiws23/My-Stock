import "dotenv/config";
import { seedDatabase } from "../lib/store";

async function main() {
  await seedDatabase();
  console.log("Seed complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
