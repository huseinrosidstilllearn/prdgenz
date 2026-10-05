import type { SVGProps } from "react";
const paths = {
  document: [
    "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z",
    "M14 3v6h6",
    "M8 13h8M8 17h5",
  ],
  moon: ["M20.5 13.2A8.5 8.5 0 0 1 10.8 3.5 8.5 8.5 0 1 0 20.5 13.2Z"],
  sun: [
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    "M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5",
  ],
  arrow: ["M5 12h14M13 6l6 6-6 6"],
  chevron: ["m6 9 6 6 6-6"],
  check: ["m5 12 4 4L19 6"],
  coffee: [
    "M4 8h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z",
    "M16 9h2a3 3 0 0 1 0 6h-2M3 22h15M7 2v3M12 2v3",
  ],
  book: [
    "M12 5C8 2 5 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-5-2-9 1Z",
    "M12 5v15",
  ],
  chart: ["M4 3v17h17M8 16v-4M13 16V7M18 16v-7"],
  bolt: ["m13 2-9 12h7l-1 8 10-12h-7Z"],
  chat: [
    "M21 11a8 8 0 0 1-8 8H9l-6 3V7a4 4 0 0 1 4-4h6a8 8 0 0 1 8 8Z",
    "M7 9h10M7 13h6",
  ],
  layers: ["m12 3 10 5-10 5L2 8Z", "m2 12 10 5 10-5M2 16l10 5 10-5"],
  history: ["M3 11a9 9 0 1 1 2 7M3 4v7h7", "M12 7v5l3 2"],
  target: [
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18",
    "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10",
    "M12 11v2",
  ],
  download: ["M12 3v12m-5-5 5 5 5-5", "M5 16v4h14v-4"],
  list: ["M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1"],
  key: ["M8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10", "m12 12 9 9M17 17l3-3M19 19l3-3"],
  plus: ["M12 5v14M5 12h14"],
  settings: ["M4 7h16M4 17h16M8 4v6M16 14v6"],
} as const;
export type IconName = keyof typeof paths;
export function Icon({
  name,
  className = "icon h-4 w-4 shrink-0",
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {paths[name].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
