import 'dotenv/config';
import http from "http";
import { createApp } from "./index.js";

async function start() {
  const app = await createApp({ serveLocalUploads: true });
  const server = http.createServer(app);
  const vite = (app as any).__vite ?? {};

  if (process.env.NODE_ENV === "development") {
    await vite.setupVite?.(app, server);
  } else {
    vite.serveStatic?.(app);
  }

  const port = Number(process.env.PORT ?? 5000);
  const host = process.env.HOST ?? "0.0.0.0";

  server.listen({ port, host }, () => {
    (vite.log ?? console.log)(`serving on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start development server:", error);
  process.exit(1);
});
