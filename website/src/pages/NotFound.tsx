import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AgentFlightLogo } from "@/components/AgentFlightLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="af flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--af-bg))] px-5 text-center font-af-body text-[hsl(var(--af-fg))]">
      <div className="mb-6">
        <AgentFlightLogo className="scale-125" />
      </div>
      <h1 className="mb-2 font-mono text-4xl font-bold tracking-wider">404</h1>
      <p className="mb-6 font-mono text-sm text-[hsl(var(--af-muted))]">Route not found in AgentFlight CLI.</p>
      <Link
        to="/"
        className="af-glass rounded-lg px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-[hsl(var(--af-fg)/0.1)]"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
