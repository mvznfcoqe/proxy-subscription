import { env } from "~/env";
import { client } from "./generated/remnawave/client.gen";

client.setConfig({
	baseUrl: env.REMNAWAVE_PANEL_URL,
	headers: {
		Authorization: `Bearer ${env.REMNAWAVE_API_KEY}`,
	},
});
