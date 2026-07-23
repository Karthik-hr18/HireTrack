# Contributing to HireTrack

Thank you for your interest in contributing to HireTrack! We welcome open-source contributions to improve functionality, user experience, and performance.

## Monorepo Workflow

HireTrack is organized as a monorepo utilizing npm workspaces:
- `packages/shared`: Common schemas (Zod) and TypeScript types imported by client and server.
- `server`: Node/Express backend.
- `client`: Vite/React Web client.

### Building
Before running the backend or frontend workspaces, compile the shared schema:
```bash
npm run build:shared
```

### Running Locally
To launch development environments for both clients and API servers simultaneously:
1. Start the server (port 5000):
   ```bash
   npm run dev:server
   ```
2. Start the client (port 5173):
   ```bash
   npm run dev:client
   ```

### Code Style Guidelines
- **TypeScript Strict**: Explicit type annotations are required.
- **Zod Validation**: Keep validation rules in the shared packages workspace so client validation checks align exactly with backend checks.
- **Git Hygiene**: Commits should be descriptive and focused on clear functional updates.
