import { Level } from "@sub/shared";
import { env } from "@/env";

export const SquadByLevel = {
	[Level.FREE]: env.FREE_SQUAD_UUID,
	[Level.PAID]: env.PAID_SQUAD_UUID,
};

export const DataLimitBySqualLevel = {
	[Level.FREE]: 100,
	[Level.PAID]: 1200,
} as const;
