export interface Stat {
  value: number;
  from?: number;
  label: string;
  suffix?: string;
}

export const stats: Stat[] = [
  { value: 6, label: "Bedrooms" },
  { value: 8, label: "Bathrooms" },
  { value: 12500, label: "Square Feet" },
  { value: 4, label: "Floors" },
  { value: 2026, from: 2015, label: "Completion" },
];
