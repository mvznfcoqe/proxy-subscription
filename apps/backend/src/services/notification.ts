import { ofetch } from "ofetch";
import { env } from "~/env";
import { logger } from "~/logger";

export interface DonationNotification {
	telegramId: number;
}

export async function sendDonationNotification(
	notification: DonationNotification,
) {
	try {
		logger.info(
			{
				event: "sending_donation_notification",
				telegramId: notification.telegramId,
			},
			"Sending donation notification to bot",
		);

		await ofetch(env.BOT_WEBHOOK_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Api-Key": env.BOT_WEBHOOK_API_KEY,
			},
			body: notification,
			timeout: 5000,
		});

		logger.info(
			{
				event: "donation_notification_sent",
				telegramId: notification.telegramId,
			},
			"Donation notification sent successfully",
		);
	} catch (error) {
		logger.error(
			{
				event: "donation_notification_failed",
				telegramId: notification.telegramId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Failed to send donation notification to bot",
		);
	}
}
