import { parseResponse } from "hono/client";
import { bot } from "../..";

type Params = Parameters<typeof bot.webhook.donation.$post>["0"];

export const sendDonationInfo = async (params: Params) => {
	return await parseResponse(bot.webhook.donation.$post(params));
};
