import type { Context } from "grammy";
import { env } from "@/env";

const donateText = `
Бот работает бесплатно и останется таким. Но если вы хотите поддержать сервис, это можно сделать в боте ${env.DONATE_BOT_USERNAME}

За каждые 100р (в рамках одного платежа) вам будет предоставлен расширенный доступ на 30 дней к сервису:
1. 1.2ТБ трафика
2. Локации, которых нет в бесплатной подписке

Если появились какие-то проблемы, то пишите ${env.ADMIN_USERNAME}
`;

export const donate = async (ctx: Context) => {
	ctx.reply(donateText);
};
