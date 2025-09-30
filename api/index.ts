import type { IncomingMessage, ServerResponse } from "http";
import type { Express } from "express";
import { createApp } from "../server";

let cachedAppPromise: Promise<Express> | null = null;

async function getApp(): Promise<Express> {
  if (!cachedAppPromise) {
    cachedAppPromise = createApp();
  }
  return cachedAppPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();
  app(req as any, res as any);
}
