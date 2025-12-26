export enum SubscriptionStatus {
	INITIAL = "initial",
	WAITING = "waiting",
	ACTIVE = "active",
	DISABLED = "disabled",
	REJECTED = "rejected",
}

export enum DisabledReason {
	UNSUBSCRIBED = "unsubscribed",
	FRAUD = "fraud",
}

export enum Level {
	FREE = "free",
	PAID = "paid",
}
