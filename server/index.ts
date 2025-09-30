import fs from "fs";
import path from "path";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { registerRoutes } from "./routes.js";
import { log } from "./vite.js";

export interface CreateAppOptions {
  /** Serve local uploads folder (useful for development fallback) */
  serveLocalUploads?: boolean;
}

function attachRequestLogger(app: Express) {
  app.use((req, res, next) => {
    const start = Date.now();
    const pathName = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined;

    const originalResJson = res.json;
    res.json = function (...args: Parameters<typeof originalResJson>) {
      capturedJsonResponse = args[0];
      return originalResJson.apply(res, args);
    } as typeof res.json;

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (!pathName.startsWith("/api")) {
        return;
      }

      let logLine = `${req.method} ${pathName} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch (_error) {
          // Ignore serialization errors for logging
        }
      }

      if (logLine.length > 160) {
        logLine = `${logLine.slice(0, 157)}…`;
      }

      log(logLine);
    });

    next();
  });
}

export async function createApp(options: CreateAppOptions = {}) {
  const app = express();

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: false }));

  const assessmentsPath = path.resolve(process.cwd(), "assessments");
  if (fs.existsSync(assessmentsPath)) {
    app.use("/assessments", express.static(assessmentsPath));
  }

  if (options.serveLocalUploads) {
    const uploadsPath = path.resolve(process.cwd(), "uploads");
    if (fs.existsSync(uploadsPath)) {
      app.use("/uploads", express.static(uploadsPath));
    }
  }

  attachRequestLogger(app);

  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";

    res.status(status).json({ message });

    if (process.env.NODE_ENV !== "test") {
      log(`Unhandled error at ${_req?.path ?? "unknown"}: ${message}`);
      console.error(err);
    }
  });

  return app;
}
