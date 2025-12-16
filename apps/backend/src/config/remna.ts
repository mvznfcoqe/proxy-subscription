import { env } from "~/env";

export const Levels = {
	free: env.FREE_SQUAD_UUID,
	paid: env.PAID_SQUAD_UUID,
};

export const DataLimitBySqualLevel = {
	free: 100,
	paid: 1200,
} as const;
