export type AxiosLikeError = {
  response?: { data?: { message?: string } };
  message: string;
};

export function isAxiosError(e: unknown): e is AxiosLikeError {
  return (
    typeof e === "object" &&
    e !== null &&
    "message" in e &&
    typeof (e as { message: unknown }).message === "string"
  );
}

export function extractErrorMessage(
  e: unknown,
  fallback = "Something went wrong"
): string {
  if (isAxiosError(e)) {
    return e.response?.data?.message ?? e.message;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}
