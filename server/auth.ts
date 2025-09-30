import type { Express, Request, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { randomUUID } from "crypto";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const authDisabled = process.env.AUTH_DISABLED !== "false";
const hasDatabase = !!process.env.DATABASE_URL;
const disabledUserId = process.env.AUTH_DISABLED_USER_ID ?? "demo-user";
const disabledUserEmail = process.env.AUTH_DISABLED_EMAIL ?? "demo@local.test";
const disabledUserName = process.env.AUTH_DISABLED_USER_NAME ?? "Demo User";
const demoUserProfile = {
  id: disabledUserId,
  email: disabledUserEmail,
  firstName: disabledUserName,
  lastName: null as string | null,
  profileImageUrl: null as string | null,
};

const demoUserResponse = {
  id: demoUserProfile.id,
  email: demoUserProfile.email,
  firstName: demoUserProfile.firstName,
  lastName: demoUserProfile.lastName,
  profileImageUrl: demoUserProfile.profileImageUrl,
  username: sanitizeUsername(demoUserProfile.email ?? "demo"),
  level: 1,
  exp: 0,
  streak: 0,
  totalDays: 0,
  completedTasks: 0,
  totalTime: 0,
  achievements: [] as any[],
  currentLevel: 1,
  currentExercise: 1,
  completedExercises: {} as Record<string, number>,
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
};

interface SessionClaims {
  sub: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  profile_image_url?: string | null;
}

export interface SessionUser {
  claims: SessionClaims;
  expires_at: number; // epoch seconds
}

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

declare global {
  namespace Express {
    interface User extends SessionUser {}
  }
}

let cachedSessionMiddleware: RequestHandler | null = null;

function createSessionMiddleware(): RequestHandler {
  if (!process.env.SESSION_SECRET && !(authDisabled && !hasDatabase)) {
    throw new Error("SESSION_SECRET is required. Set it in your environment variables.");
  }

  let store: session.Store;

  if (hasDatabase) {
    const pgStore = connectPg(session);
    store = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      tableName: "sessions",
      ttl: SESSION_TTL_MS / 1000,
    });

    store.on("error", (error: unknown) => {
      console.error("Session store error:", error);
    });
  } else {
    store = new session.MemoryStore();
  }

  cachedSessionMiddleware = session({
    secret: process.env.SESSION_SECRET ?? "demo-session-secret",
    store,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL_MS,
    },
  });

  return cachedSessionMiddleware;
}

function getSessionMiddleware() {
  return cachedSessionMiddleware ?? createSessionMiddleware();
}

function getDemoSessionUser(): SessionUser {
  return buildSessionUser({
    id: demoUserProfile.id,
    email: demoUserProfile.email,
    firstName: demoUserProfile.firstName,
    lastName: demoUserProfile.lastName,
    profileImageUrl: demoUserProfile.profileImageUrl,
  });
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sanitizeUsername(email: string) {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const candidate = base || "player";
  return `${candidate}-${randomUUID().slice(0, 8)}`.toLowerCase();
}

function buildSessionUser(user: { id: string; email: string | null; firstName?: string | null; lastName?: string | null; profileImageUrl?: string | null; }) : SessionUser {
  return {
    claims: {
      sub: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      profile_image_url: user.profileImageUrl,
    },
    expires_at: Math.floor((Date.now() + SESSION_TTL_MS) / 1000),
  };
}

export function getSessionUser(req: Request): SessionUser | undefined {
  if (req.session?.user) {
    return req.session.user;
  }

  if (authDisabled && !hasDatabase) {
    const demoSession = getDemoSessionUser();
    (req as any).session = (req as any).session ?? {};
    (req as any).session.user = demoSession;
    return demoSession;
  }

  return undefined;
}

function attachDemoSession(app: Express) {
  app.use((req, _res, next) => {
    const sessionUser = getDemoSessionUser();
    (req as any).session = (req as any).session ?? {};
    if (!(req as any).session.user) {
      (req as any).session.user = sessionUser;
    }
    req.user = (req as any).session.user as Express.User;
    next();
  });
}

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  if (authDisabled && !hasDatabase) {
    attachDemoSession(app);
  } else {
    app.use(getSessionMiddleware());

    // Bridge session user to Express.User for backwards compatibility
    app.use((req, _res, next) => {
      if (req.session?.user) {
        req.user = req.session.user as Express.User;
      }
      next();
    });

    if (authDisabled) {
      app.use(async (req, _res, next) => {
        try {
          if (!req.session) return next();

          if (!req.session.user) {
            let sessionUser: SessionUser;

            let user = await storage.getUser(disabledUserId);
            if (!user) {
              user = await storage.upsertUser({
                id: disabledUserId,
                email: disabledUserEmail,
                firstName: disabledUserName,
                username: sanitizeUsername(disabledUserEmail),
              });
            }

            sessionUser = buildSessionUser(user);

            req.session.user = sessionUser;
            req.user = sessionUser as Express.User;
          }

          next();
        } catch (error) {
          next(error);
        }
      });
    }
  }

  app.post("/api/auth/login", async (req, res) => {
  if (authDisabled) {
      if (!hasDatabase) {
        return res.status(200).json({ message: "Authentication disabled", user: demoUserResponse });
      }
      if (!req.session?.user) {
        const sessionUser = getDemoSessionUser();
        req.session!.user = sessionUser;
      }
      return res.status(200).json({ message: "Authentication disabled" });
    }
    try {
      const { email, accessCode, name } = req.body ?? {};

      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }

      const normalizedEmail = normalizeEmail(email);

      const allowedEmailsRaw = process.env.AUTH_ALLOWED_EMAILS;
      if (allowedEmailsRaw) {
        const allowed = allowedEmailsRaw
          .split(",")
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean);
        if (!allowed.includes(normalizedEmail)) {
          return res.status(401).json({ message: "Email is not authorized" });
        }
      }

      const requiredAccessCode = process.env.AUTH_ACCESS_CODE;
      if (requiredAccessCode) {
        if (!accessCode || accessCode !== requiredAccessCode) {
          return res.status(401).json({ message: "Invalid access code" });
        }
      }

      let user = await storage.getUserByEmail(normalizedEmail);

      if (!user) {
        const displayName = typeof name === "string" && name.trim().length > 0
          ? name.trim()
          : normalizedEmail.split("@")[0];

        const generatedId = randomUUID();

        user = await storage.upsertUser({
          id: generatedId,
          email: normalizedEmail,
          firstName: displayName,
          username: sanitizeUsername(normalizedEmail),
        });
      } else {
        // Refresh last active timestamp on login
        user = await storage.updateUser(user.id, {});
      }

      const sessionUser = buildSessionUser(user);
      req.session.user = sessionUser;
      req.user = sessionUser as Express.User;

      res.json({
        message: "Login successful",
        user,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    if (authDisabled) {
      if (!hasDatabase) {
        return res.status(204).end();
      }
      return res.status(204).end();
    }
    if (!req.session) {
      return res.status(204).end();
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }

      res.clearCookie("connect.sid");
      res.status(204).end();
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (authDisabled) {
    return next();
  }
  const sessionUser = req.session?.user;
  if (!sessionUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (sessionUser.expires_at <= nowSeconds) {
    req.session.destroy(() => {
      res.status(401).json({ message: "Session expired" });
    });
    return;
  }

  next();
};

export { authDisabled };
export { hasDatabase };
export { demoUserProfile };
export { demoUserResponse };
