# PowerIQ

## Run the backend

From the repository root, start the FastAPI backend with:

```powershell
python main.py
```

The API is available at http://localhost:8000, with interactive documentation
at http://localhost:8000/docs.

## Run the frontend

```powershell
npm run dev
```

## Deploy frontend and backend together on Vercel

The repository includes `vercel.json` and `api/[...path].py`, so Vercel can
serve the Vite frontend and FastAPI backend from the same deployment. Keep the
Vercel install command as `npm install` and the build command as `npm run build`.
The deployed API is available under `/api`.

Vercel does not provide persistent WebSocket connections. The deployed
frontend therefore refreshes API data over HTTP every five seconds; local
development continues to use the WebSocket backend.

---

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
## checking
