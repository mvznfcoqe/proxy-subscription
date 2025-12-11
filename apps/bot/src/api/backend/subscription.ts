import { parseResponse } from "hono/client";
import { backend } from "./index";

export const getSubscription = async (userId: number) => {
	return await parseResponse(
		backend.subscription[":id"].$get({
			param: { id: userId.toString() },
		}),
	);
};

export const createSubscription = async (userId: number) => {
	return await parseResponse(
		backend.subscription.$post({
			json: { id: userId },
		}),
	);
};
