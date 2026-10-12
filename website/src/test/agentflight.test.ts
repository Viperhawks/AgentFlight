import { afterEach, describe, expect, it, vi } from "vitest";
import { copyAgentFlightCommand, INSTALL_COMMAND, USAGE_COMMAND } from "@/lib/agentflight";

afterEach(() => vi.unstubAllGlobals());

describe("AgentFlight quick start", () => {
  it("copies the exact installation command without hidden characters", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    await copyAgentFlightCommand(INSTALL_COMMAND);
    expect(writeText).toHaveBeenCalledWith("pip install agentflight-cli");
  });

  it("copies the basic pytest usage command", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    await copyAgentFlightCommand(USAGE_COMMAND);
    expect(writeText).toHaveBeenCalledWith("agentflight pytest");
  });
});