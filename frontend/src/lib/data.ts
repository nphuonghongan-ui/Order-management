export const FilterType = {
  all: "ALL",
  active: "SUBMITTED",
  completed: "CONFIRMED",
} as const;

export type FilterTypeValue = (typeof FilterType)[keyof typeof FilterType];
