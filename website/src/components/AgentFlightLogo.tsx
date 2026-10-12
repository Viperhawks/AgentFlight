import logoImg from "@/assets/logo.png";

interface AgentFlightLogoProps {
  /** Show the uploaded full logo card image */
  variant?: "mark" | "lockup" | "badge";
  className?: string;
  size?: number;
}

/**
 * Renders the AgentFlight `>_ agentflight` brand mark or full uploaded logo image.
 */
export function AgentFlightLogo({
  variant = "lockup",
  className = "",
  size = 32,
}: AgentFlightLogoProps) {
  if (variant === "badge") {
    return (
      <div
        className={`relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-[hsl(var(--af-fg)/0.16)] bg-black shadow-[0_0_50px_-12px_hsl(var(--af-fg)/0.25)] ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={logoImg}
          alt="AgentFlight CLI logo"
          className="h-full w-full object-contain select-none"
          draggable={false}
        />
      </div>
    );
  }

  if (variant === "mark") {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-[hsl(var(--af-fg)/0.18)] bg-black ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path d="M15 17L33 28.5V34L15 45.5V37.8L26.2 31.2L15 24.7V17Z" fill="currentColor" />
          <rect x="35" y="39" width="15" height="6.5" fill="currentColor" />
        </svg>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[hsl(var(--af-fg)/0.18)] bg-black"
        style={{ width: size, height: size }}
      >
        <img
          src={logoImg}
          alt="AgentFlight logo"
          className="h-full w-full scale-125 object-cover select-none"
          draggable={false}
        />
      </span>
      <span className="font-mono text-base font-bold lowercase tracking-[0.16em] text-[hsl(var(--af-fg))]">
        agentflight
      </span>
    </span>
  );
}

