import http from "http";
import { createApp } from "./index.js";
import { setupVite, serveStatic, log } from "./vite.js";

async function start() {
  const app = await createApp({ serveLocalUploads: true });
  const server = http.createServer(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT ?? 5000);
  const host = process.env.HOST ?? "0.0.0.0";

  server.listen({ port, host }, () => {
    log(`serving on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start development server:", error);
  process.exit(1);
});
