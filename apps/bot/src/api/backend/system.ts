import { parseResponse } from "hono/client";
import { backend } from ".";

export const getSystemConfiguration = async () => {
	return await parseResponse(backend.system.settings.$get());
};
