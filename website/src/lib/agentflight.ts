export const AGENTFLIGHT_REPO = "https://github.com/Viperhawks/AgentFlight";
export const AGENTFLIGHT_DOCS = `${AGENTFLIGHT_REPO}#readme`;
export const AGENTFLIGHT_PYPI = "https://pypi.org/project/agentflight-cli/";
export const AGENTFLIGHT_VERSION = "1.0.1";
export const INSTALL_COMMAND = "pip install agentflight-cli";
export const USAGE_COMMAND = "agentflight pytest";

export async function copyAgentFlightCommand(command: string) {
  await navigator.clipboard.writeText(command);
}