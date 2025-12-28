import { Level } from "@sub/shared";
import { Hono } from "hono";
import { DataLimitBySqualLevel } from "@/config/remna";
import { env } from "@/env";

export const system = new Hono().get("/settings", async (ctx) => {
	return ctx.json({
		sumForMonth: env.SUM_FOR_MONTH,
		dataLimitByLevel: {
			free: DataLimitBySqualLevel[Level.FREE],
			paid: DataLimitBySqualLevel[Level.PAID],
		},
	});
});
