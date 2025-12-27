import { DisabledReason, SubscriptionStatus } from "@sub/shared";
import type { Context } from "grammy";
import {
	getUserByTelegramId,
	updateSubscriptionStatus,
} from "../api/backend/user";
import { env } from "../env";

export const handleChatMembersChanged = async (ctx: Context) => {
	if (!ctx.chat || !ctx.chatMember) return;

	if (env.CHANNEL_ID !== ctx.chat.id.toString()) return;

	const chatMember = ctx.chatMember;
	const newStatus = chatMember.new_chat_member.status;
	const telegramId = chatMember.from.id;

	const isUnsubcribed =
		newStatus === "left" ||
		newStatus === "kicked" ||
		newStatus === "restricted";

	if (!isUnsubcribed) return;

	try {
		const user = await getUserByTelegramId(telegramId);
		await updateSubscriptionStatus(
			user.id,
			SubscriptionStatus.DISABLED,
			DisabledReason.UNSUBSCRIBED,
		);
	} catch {}

	ctx.api.sendMessage(
		telegramId,
		`Доступ к подписке был заблокирован, так как вы не являетесь участником [канала](${env.CHANNEL_LINK})`,
		{
			parse_mode: "Markdown",
		},
	);
};
