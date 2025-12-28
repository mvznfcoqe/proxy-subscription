import type { Context } from "grammy";
import { env } from "@/env";

export const start = async (ctx: Context) => {
	const startText = `
Привет. Это бот, выдающий доступ к прокси за подписку к моему [каналу](${env.CHANNEL_LINK}).

Команды:
/getsub - запросить подписку
/donate - информация о донате. за донат можно получить расширенный доступ к сервису
`;

	ctx.reply(startText, {
		parse_mode: "Markdown",
	});
};
