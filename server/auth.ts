import type { Express, Request, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage.js";
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

export function buildSessionUser(user: { id: string; email: string | null; firstName?: string | null; lastName?: string | null; profileImageUrl?: string | null; }) : SessionUser {
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

  // Registration endpoint for email/password authentication
  app.post("/api/auth/register", async (req, res) => {
    if (authDisabled && !hasDatabase) {
      return res.status(200).json({ message: "Authentication disabled", user: demoUserResponse });
    }

    try {
      const { email, password, firstName, lastName } = req.body ?? {};

      // Validate required fields
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }

      if (!password || typeof password !== "string") {
        return res.status(400).json({ message: "Password is required" });
      }

      if (!firstName || typeof firstName !== "string") {
        return res.status(400).json({ message: "First name is required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const normalizedEmail = normalizeEmail(email);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Hash password
      const { hashPassword } = await import("./passwordService.js");
      const passwordHash = await hashPassword(password);

      // Create new user
      const generatedId = randomUUID();
      const user = await storage.upsertUser({
        id: generatedId,
        email: normalizedEmail,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName?.trim() || null,
        username: sanitizeUsername(normalizedEmail),
      });

      console.log(`New user registered: ${user.email} (ID: ${user.id})`);

      res.status(201).json({
        message: "Registration successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Login endpoint for email/password authentication
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
      const { email, password } = req.body ?? {};

      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }

      if (!password || typeof password !== "string") {
        return res.status(400).json({ message: "Password is required" });
      }

      const normalizedEmail = normalizeEmail(email);

      // Find user by email
      const user = await storage.getUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if user has a password set
      if (!user.passwordHash) {
        return res.status(401).json({ message: "Please contact support to set up your password" });
      }

      // Verify password
      const { comparePassword } = await import("./passwordService.js");
      const isPasswordValid = await comparePassword(password, user.passwordHash);

      if (!isPasswordValid) {
        console.log(`Failed login attempt for: ${user.email}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Refresh last active timestamp on login
      await storage.updateUser(user.id, {});

      // Create session
      const sessionUser = buildSessionUser(user);
      req.session.user = sessionUser;
      req.user = sessionUser as Express.User;

      console.log(`User logged in: ${user.email} (ID: ${user.id})`);

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          level: user.level,
          exp: user.exp,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Lazy migration endpoint for Supabase Auth transition
  app.post("/api/auth/migrate-login", async (req, res) => {
    if (authDisabled && !hasDatabase) {
      return res.status(200).json({ message: "Authentication disabled", user: demoUserResponse });
    }

    try {
      const { handleMigrateLogin } = await import("./migrateAuth.js");
      await handleMigrateLogin(req, res);
    } catch (error) {
      console.error("Migration login error:", error);
      res.status(500).json({ message: "Failed to process migration login" });
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
