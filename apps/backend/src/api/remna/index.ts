import { RemnawaveSDK } from "@mishkat/remnawave-sdk";
import { env } from "../../env.ts";

export const remnaClient = new RemnawaveSDK({
	apiKey: env.REMNAWAVE_API_KEY,
	panelUrl: env.REMNAWAVE_PANEL_URL,
});
