import { eq } from "drizzle-orm";
import { db } from "~/db";
import { users } from "~/db/schema";

export const getUserById = async (id: number) => {
	const user = await db.query.users
		.findFirst({
			where: eq(users.id, id),
		})
		.catch(() => null);

	return user;
};

export const getUserByTelegramId = async (telegramId: number) => {
	const user = await db.query.users
		.findFirst({
			where: eq(users.telegramId, telegramId),
		})
		.catch(() => null);

	return user;
};
