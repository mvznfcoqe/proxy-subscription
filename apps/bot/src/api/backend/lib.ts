import { DetailedError } from "hono/client";

type BackendError = DetailedError;

export const isBackendError = (error: unknown): error is BackendError => {
	return error instanceof DetailedError;
};
