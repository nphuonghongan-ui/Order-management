import { useCallback } from "react";
import { useNavigate, type NavigateOptions } from "react-router";

export function useNavigation(
  toBaseAddress: string,
  queryParams: Record<string, string | undefined> = {},
  options?: NavigateOptions,
) {
  const navigate = useNavigate();
  return useCallback(
    (toOverride?: unknown, optionsOverride?: NavigateOptions) => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined) params.set(key, value);
      }
      const qs = params.toString();
      const base =
        typeof toOverride === "string" ? toOverride : toBaseAddress;
      navigate(qs ? `${base}?${qs}` : base, optionsOverride ?? options);
    },
    [toBaseAddress, queryParams, options, navigate],
  );
}
