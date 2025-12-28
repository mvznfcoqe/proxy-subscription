import type { Context } from "grammy";
import { getSystemConfiguration } from "@/api/backend/system";
import { env } from "@/env";

export const donate = async (ctx: Context) => {
	const systemConfiguration = await getSystemConfiguration();

	const donateText = `
Бот работает бесплатно и останется таким. Но если вы хотите поддержать сервис, это можно сделать в боте ${env.DONATE_BOT_USERNAME}

За каждые ${systemConfiguration.sumForMonth}р (в рамках одного платежа) вам будет предоставлен расширенный доступ на 30 дней к сервису:
1. ${systemConfiguration.dataLimitByLevel.paid}ГБ трафика
2. Локации, которых нет в бесплатной подписке

Если появились какие-то проблемы, то пишите ${env.ADMIN_USERNAME}
`;

	ctx.reply(donateText);
};
