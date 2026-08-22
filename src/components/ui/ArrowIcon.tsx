export default function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      className={direction === "left" ? "rotate-180" : ""}
    >
      <path d="M9.5 0.5L15 6L9.5 11.5M15 6H1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
