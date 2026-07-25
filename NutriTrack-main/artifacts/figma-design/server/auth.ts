import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import type { Express, Request, Response, NextFunction } from "express";

const MemoryStoreSession = MemoryStore(session);

// ── Passport local strategy ────────────────────────────────────────────────
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmailOrUsername(email.trim());
        if (!user || user.password !== password) {
          return done(null, false, { message: "Invalid email or password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user ?? null);
  } catch (err) {
    done(err);
  }
});

// ── Middleware setup ───────────────────────────────────────────────────────
export function setupAuth(app: Express) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "nutritrack-dev-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({ checkPeriod: 86_400_000 }),
      cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
}

// ── Auth guard ─────────────────────────────────────────────────────────────
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not authenticated." });
}

export { passport };
