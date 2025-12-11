import { eq } from "drizzle-orm";
import { db } from "~/db";
import { users } from "~/db/schema";

export const getUserById = async (id: number) => {
	return await db.query.users.findFirst({
		where: eq(users.id, id),
	});
};

export const getUserByTelegramId = async (telegramId: number) => {
	return await db.query.users.findFirst({
		where: eq(users.telegramId, telegramId),
	});
};
