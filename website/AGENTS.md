# Architecture rules

- Keep AgentFlight on React and Vite, using local UI state without additional backend services, because its landing-page experience is static.
- Keep AgentFlight repository links and copyable commands in one shared module so every call to action and quick-start snippet uses consistent destinations and values.