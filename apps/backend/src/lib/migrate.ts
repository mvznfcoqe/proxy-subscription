import { migrate } from "drizzle-orm/bun-sql/migrator";
import { db } from "@/db";

export const migrateDatabase = async () => {
	await migrate(db, { migrationsFolder: "./drizzle" });
};
