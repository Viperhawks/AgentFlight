interface AgentFlightLogoProps {
  className?: string;
}

/**
 * Clean terminal brand lockup matching Image 2: `>_ agentflight`
 */
export function AgentFlightLogo({ className = "" }: AgentFlightLogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-[15px] font-bold tracking-[0.18em] text-[hsl(var(--af-fg))] transition-opacity hover:opacity-90 select-none ${className}`}
    >
      <span className="text-[17px] font-extrabold tracking-normal text-[hsl(var(--af-fg))]">
        &gt;_
      </span>
      <span>agentflight</span>
    </span>
  );
}
