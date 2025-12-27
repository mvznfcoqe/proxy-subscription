import { sendDonationInfo } from "~/api/bot/webhook/donation";
import { logger } from "~/logger";

export async function sendDonationNotification({
	telegramId,
}: {
	telegramId: number;
}) {
	try {
		logger.info(
			{
				event: "sending_donation_notification",
				telegramId: telegramId,
			},
			"Sending donation notification to bot",
		);

		await sendDonationInfo({ json: { telegramId } });

		logger.info(
			{
				event: "donation_notification_sent",
				telegramId: telegramId,
			},
			"Donation notification sent successfully",
		);
	} catch (error) {
		logger.error(
			{
				event: "donation_notification_failed",
				telegramId: telegramId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Failed to send donation notification to bot",
		);
	}
}
