import type { User } from "@sub/backend/types";
import { isBackendError } from "@/api/backend/lib";
import { createUser, getUserByTelegramId } from "@/api/backend/user";

export const getOrCreateUserByTelegramId = async (
	telegramId: User["telegramId"],
) => {
	let user: User | null = null;

	try {
		user = await getUserByTelegramId(telegramId);
	} catch (error) {
		if (!isBackendError(error)) return;

		if (error.statusCode === 404) {
			user = await createUser(telegramId);
		}
	}

	return user;
};
